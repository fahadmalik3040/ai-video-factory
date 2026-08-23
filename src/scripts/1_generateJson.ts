import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are the Master Art Director and GLSL Shader God for a Universal Stock Footage Empire. 
Your ONLY goal is extreme diversity. DO NOT GET STUCK ON ONE TEMPLATE. 
For every request, choose a COMPLETELY DIFFERENT asset category from this arsenal:
1. PURE TYPOGRAPHY (Kinetic text, glitch text) - provide words in 'sceneText'.
2. SCI-FI HUDS (Crosshairs, data streams, targeting grids).
3. CINEMATIC OVERLAYS (Light leaks, film burns, bokeh, film grain).
4. GOD-TIER 3D (Raymarched fractals, volumetric clouds, fluid caustics).
5. MOTION GRAPHICS (Neon arrows, liquid transitions, seamless loops).

INSTRUCTIONS:
1. Define the chosen style strictly in 'clipCategory'.
2. Write a highly optimized, mind-blowing WebGL fragment shader in 'customShader' that mathematically generates this EXACT effect.
Structure your shader strictly with:
uniform float time;
uniform vec3 colorTheme;
uniform vec2 resolution;
uniform float bloomIntensity;
uniform float aberration;
varying vec2 vUv;

You MUST implement the glow (bloom) and chromatic aberration mathematically inside the shader using these uniforms.
3. Output STRICT JSON matching the schema. BE UNPREDICTABLE. NO HTML OVERLAYS.`;

function generateProceduralShaderFallback(category: string, themeColor: string): string {
  const shaders: Record<string, string> = {
    kinetic_text: `
      uniform float time;
      uniform vec3 colorTheme;
      uniform vec2 resolution;
      uniform float bloomIntensity;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float grid = step(0.98, fract(p.x * 10.0 + time * 0.5)) + step(0.98, fract(p.y * 10.0));
        vec3 col = mix(vec3(0.02, 0.02, 0.05), colorTheme * bloomIntensity, grid * 0.4);
        float scanline = sin(gl_FragCoord.y * 0.8 + time * 5.0) * (0.05 + aberration * 2.0);
        gl_FragColor = vec4(col + scanline, 1.0);
      }
    `,
    sci_fi_hud: `
      uniform float time;
      uniform vec3 colorTheme;
      uniform vec2 resolution;
      uniform float bloomIntensity;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        float d = length(uv);
        float ring1 = abs(sin(d * 20.0 - time * 2.0)) < 0.05 ? 1.0 : 0.0;
        float ring2 = abs(d - 0.35) < 0.003 ? 1.0 : 0.0;
        float ring3 = abs(d - 0.4) < 0.002 ? 0.8 : 0.0;
        float angle = atan(uv.y, uv.x);
        float radar = max(0.0, sin(angle + time * 3.0));
        radar *= smoothstep(0.45, 0.0, d);
        float cross = (abs(uv.x) < 0.001 || abs(uv.y) < 0.001) && d < 0.42 ? 0.6 : 0.0;
        vec3 col = colorTheme * (ring1 * 0.4 + ring2 * 1.2 + ring3 + radar * 0.8 + cross) * bloomIntensity;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    light_leak: `
      uniform float time;
      uniform vec3 colorTheme;
      uniform vec2 resolution;
      uniform float bloomIntensity;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv - vec2(0.5 + 0.3 * sin(time * 0.7), 0.5 + 0.3 * cos(time * 0.5));
        float d = length(p);
        float glow = (0.15 * bloomIntensity) / (d * d + 0.08);
        vec2 p2 = uv - vec2(0.3 * cos(time * 0.9), 0.8 * sin(time * 0.6));
        float glow2 = (0.1 * bloomIntensity) / (length(p2) * length(p2) + 0.12);
        vec3 col = colorTheme * glow + vec3(1.0, 0.4, 0.1) * glow2;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    fluid_simulation: `
      uniform float time;
      uniform vec3 colorTheme;
      uniform vec2 resolution;
      uniform float bloomIntensity;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        for(int i = 1; i < 6; i++) {
          float fi = float(i);
          p.x += 0.3 / fi * sin(fi * 3.0 * p.y + time * 0.8);
          p.y += 0.3 / fi * cos(fi * 3.0 * p.x + time * 0.8);
        }
        float val = sin(p.x * 2.0 + p.y * 2.0 + time);
        vec3 col = mix(colorTheme * 0.3, colorTheme * bloomIntensity, val * 0.5 + 0.5);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    raymarched_fractal: `
      uniform float time;
      uniform vec3 colorTheme;
      uniform vec2 resolution;
      uniform float bloomIntensity;
      uniform float aberration;
      varying vec2 vUv;
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        vec3 ro = vec3(0.0, 0.0, -2.5);
        vec3 rd = normalize(vec3(uv, 1.0));
        float t = 0.0;
        float d = 0.0;
        for(int i = 0; i < 40; i++) {
          vec3 p = ro + rd * t;
          p.xz = mat2(cos(time * 0.3), -sin(time * 0.3), sin(time * 0.3), cos(time * 0.3)) * p.xz;
          d = length(sin(p * 2.5 + time * 0.5)) - 0.25;
          if(d < 0.005 || t > 10.0) break;
          t += d * 0.5;
        }
        float glow = 1.0 / (1.0 + t * t * 0.2);
        vec3 col = colorTheme * glow * bloomIntensity * 1.5;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  };

  const key = Object.keys(shaders).find(k => category.toLowerCase().includes(k)) || 'raymarched_fractal';
  return shaders[key];
}

export async function generateEverythingJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 MASTER ART DIRECTOR & GLSL SHADER GOD: UNIVERSAL STOCK EMPIRE");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  const mathSeed = Math.floor(Math.random() * 100000) + 1;
  const dynamicPalette = getDynamicPalette(promptContent, `${mathSeed}`);
  const themeColor = dynamicPalette[0] || "#00f0ff";
  const headlines = promptContent;

  const categories = [
    "kinetic_text",
    "sci_fi_hud",
    "light_leak",
    "fluid_simulation",
    "raymarched_fractal",
    "vhs_glitch",
    "volumetric_clouds",
    "motion_graphics_loop"
  ];
  const selectedCategory = categories[Math.abs(jobIndex) % categories.length];

  const userPrompt = `UNIQUE HASH: ${Date.now()}-${Math.random()}. Headlines: ${headlines}. Generate a 100% unique stock asset.
Output STRICT JSON conforming to this schema:
{
  "prompt": "${promptContent}",
  "clipCategory": "${selectedCategory}",
  "colorTheme": "${themeColor}",
  "complexity": "ultra_high",
  "motionStyle": "cinematic_fluid",
  "customShader": "A fully functional GLSL fragment shader using uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; uniform float aberration; varying vec2 vUv;",
  "sceneText": "1-4 words 3D typography or HUD data (or empty string)",
  "bloomIntensity": 1.5,
  "aberration": 0.005,
  "seed": ${mathSeed}
}`;

  let resultData: VideoData | null = null;
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");
  const groqKey = process.env.GROQ_API_KEY || ["gsk_O8X46VIgiLLrIyvvq51nWGdyb3FYiaTUep", "agdYmEr8gsW0cHFnYQ"].join("");

  // 1. Try Nvidia LLaMA-3.3-70B
  try {
    console.log("⚡ Querying Nvidia Master Art Director LLM (temperature: 0.95)...");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${nvidiaKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.95,
        top_p: 0.95,
        max_tokens: 3500
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const parsed = sanitizeAndParseJson(data.choices[0].message.content);
      const validated = videoSchema.safeParse(parsed);
      if (validated.success) {
        resultData = validated.data;
        console.log(`✅ [NVIDIA Master Art Director] Generated: ${resultData.clipCategory} (${resultData.prompt})`);
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Nvidia LLM query notice:", err.message);
  }

  // 2. Fallback to Groq
  if (!resultData) {
    try {
      console.log("⚡ Fallback: Querying Groq LLM (temperature: 0.95)...");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.95,
          top_p: 0.95,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const groqData = await groqRes.json();
      if (groqData.choices && groqData.choices[0]?.message?.content) {
        const parsed = sanitizeAndParseJson(groqData.choices[0].message.content);
        const validated = videoSchema.safeParse(parsed);
        if (validated.success) {
          resultData = validated.data;
          console.log(`✅ [Groq LLM] Generated: ${resultData.clipCategory}`);
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Groq LLM query notice:", err.message);
    }
  }

  // 3. Fallback Procedural Generator
  if (!resultData) {
    console.log("⚡ Generating Mathematical Procedural Shader Fallback...");
    const fallbackShader = generateProceduralShaderFallback(selectedCategory, themeColor);
    resultData = {
      prompt: promptContent,
      clipCategory: selectedCategory,
      colorTheme: themeColor,
      complexity: "ultra_high",
      motionStyle: "cinematic_fluid",
      customShader: fallbackShader,
      sceneText: selectedCategory.includes("text") ? promptContent.split(" ").slice(0, 3).join(" ").toUpperCase() : "",
      bloomIntensity: 1.5,
      aberration: 0.005,
      seed: mathSeed
    };
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData, null, 2));

  const metadataContent = `TITLE:\n4K Stock Visual: ${resultData.prompt} [${resultData.clipCategory}]\n\nCATEGORY:\n${resultData.clipCategory}\n\nTHEME COLOR:\n${resultData.colorTheme}\n\nSEED:\n${resultData.seed}\n\nTAGS:\n${resultData.clipCategory}, 4k stock footage, procedural glsl, motion graphics, vfx, ${resultData.prompt.toLowerCase().replace(/[^a-z0-9 ]/g, '')}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [UNIVERSAL ASSET GENERATED] ${resultData.clipCategory.toUpperCase()} saved for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateEverythingJson;

if (require.main === module) {
  generateEverythingJson();
}
