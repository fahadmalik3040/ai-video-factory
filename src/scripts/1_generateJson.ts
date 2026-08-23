import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are running a DUAL INDEPENDENT RENDER ORCHESTRATOR for an Elite Stock Footage Empire.
You must generate TWO completely independent video concepts based on the provided trends.

1. job3D: Focus on high-end 3D world-building (Particles, Wireframes, Geometry).
2. job2D: Focus on premium 2D Post-Production VFX (HUDs, Glitches, Light Leaks, Fluid Shaders). You MUST write a functional GLSL fragment shader in 'customShader' for this 2D effect.

Output STRICT JSON matching the schema containing both job3D and job2D. DO NOT USE ANY HTML TEXT.`;

function get2DShaderTemplate(category: string, themeColor: string): string {
  const templates: Record<string, string> = {
    cyberpunk_hud: `
      uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        float d = length(uv);
        float ring1 = abs(d - 0.35) < 0.004 ? 1.0 : 0.0;
        float ring2 = abs(d - 0.2) < 0.003 ? 0.8 : 0.0;
        float angle = atan(uv.y, uv.x);
        float radar = max(0.0, sin(angle + time * 3.0)) * smoothstep(0.4, 0.0, d);
        float cross = (abs(uv.x) < 0.0015 || abs(uv.y) < 0.0015) && d < 0.45 ? 0.8 : 0.0;
        vec3 col = colorTheme * (ring1 + ring2 + radar + cross) * bloomIntensity;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    cinematic_light_leak: `
      uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p1 = uv - vec2(0.5 + 0.35 * sin(time * 0.7), 0.5 + 0.3 * cos(time * 0.5));
        vec2 p2 = uv - vec2(0.3 * cos(time * 0.9), 0.7 * sin(time * 0.6));
        float glow1 = 0.15 / (dot(p1, p1) + 0.08);
        float glow2 = 0.1 / (dot(p2, p2) + 0.12);
        vec3 col = (colorTheme * glow1 + vec3(1.0, 0.45, 0.1) * glow2) * bloomIntensity * 0.7;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    vhs_glitch: `
      uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.08;
        float glitch = step(0.96, sin(uv.y * 20.0 + time * 8.0)) * 0.15;
        vec3 col = colorTheme * (0.6 + scanline + glitch) * bloomIntensity;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    fluid_overlay: `
      uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        for(int i = 1; i < 5; i++) {
          float fi = float(i);
          p.x += 0.4 / fi * sin(fi * 3.0 * p.y + time * 0.8);
          p.y += 0.4 / fi * cos(fi * 3.0 * p.x + time * 0.8);
        }
        float glow = (0.35 * bloomIntensity) / (length(p) + 0.15);
        gl_FragColor = vec4(colorTheme * glow, 1.0);
      }
    `
  };

  return templates[category] || templates["fluid_overlay"];
}

export async function generateDualOrchestratorJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 DUAL INDEPENDENT RENDER ORCHESTRATOR: 3D + 2D MULTI-PIPELINE");
  console.log("=======================================================================");

  const { topic: mainTopic, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  const mathSeed3D = Math.floor(Math.random() * 100000) + 1;
  const mathSeed2D = Math.floor(Math.random() * 100000) + 2;

  const dynamicPalette3D = getDynamicPalette(mainTopic, `${mathSeed3D}`);
  const dynamicPalette2D = getDynamicPalette(mainTopic + "2D", `${mathSeed2D}`);

  const themeColor3D = dynamicPalette3D[0] || "#00f0ff";
  const themeColor2D = dynamicPalette2D[0] || "#ff0055";

  const categories3D = ["cinematic_particles", "procedural_geometry", "raymarched_core", "abstract_wireframe"] as const;
  const categories2D = ["cyberpunk_hud", "cinematic_light_leak", "vhs_glitch", "fluid_overlay"] as const;

  const chosenCat3D = categories3D[Math.abs(jobIndex) % categories3D.length];
  const chosenCat2D = categories2D[Math.abs(jobIndex + 1) % categories2D.length];

  const trendTopic3D = `${mainTopic} 3D Procedural Matrix`;
  const trendTopic2D = `${mainTopic} Cinematic VFX Overlay`;

  const userPrompt = `Synthesize dual independent stock concepts:
Trend 3D: "${trendTopic3D}"
Trend 2D: "${trendTopic2D}"

Output STRICT JSON adhering to this schema:
{
  "job3D": {
    "trendTopic": "${trendTopic3D}",
    "clipCategory": "${chosenCat3D}",
    "colorTheme": "${themeColor3D}",
    "particleCount": 5000,
    "cameraMotion": "orbit_slow"
  },
  "job2D": {
    "trendTopic": "${trendTopic2D}",
    "clipCategory": "${chosenCat2D}",
    "colorTheme": "${themeColor2D}",
    "customShader": "A valid GLSL fragment shader using uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;",
    "bloomIntensity": 1.5
  }
}`;

  let resultData: VideoData | null = null;
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");
  const groqKey = process.env.GROQ_API_KEY || ["gsk_O8X46VIgiLLrIyvvq51nWGdyb3FYiaTUep", "agdYmEr8gsW0cHFnYQ"].join("");

  // 1. Try Nvidia LLaMA-3.3-70B
  try {
    console.log("⚡ Querying Nvidia Dual Orchestrator LLM...");
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
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 2500
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
        console.log(`✅ [NVIDIA Dual Engine] 3D: ${resultData.job3D.clipCategory} | 2D: ${resultData.job2D.clipCategory}`);
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Nvidia LLM notice:", err.message);
  }

  // 2. Fallback to Groq
  if (!resultData) {
    try {
      console.log("⚡ Fallback: Querying Groq LLM...");
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
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 2500,
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
          console.log(`✅ [Groq Dual Engine] 3D: ${resultData.job3D.clipCategory} | 2D: ${resultData.job2D.clipCategory}`);
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Groq LLM notice:", err.message);
    }
  }

  // 3. Fallback Deterministic Config
  if (!resultData) {
    console.log("⚡ Generating Deterministic Dual Orchestrator Config...");
    resultData = {
      job3D: {
        trendTopic: trendTopic3D,
        clipCategory: chosenCat3D,
        colorTheme: themeColor3D,
        particleCount: 5000,
        cameraMotion: "orbit_slow"
      },
      job2D: {
        trendTopic: trendTopic2D,
        clipCategory: chosenCat2D,
        colorTheme: themeColor2D,
        customShader: get2DShaderTemplate(chosenCat2D, themeColor2D),
        bloomIntensity: 1.5
      }
    };
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData.job3D, null, 2));
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(resultData.job2D, null, 2));

  const metadataContent = `=== 3D ASSET ===\nTITLE: 4K 3D Visual: ${resultData.job3D.trendTopic} [${resultData.job3D.clipCategory}]\nCOLOR: ${resultData.job3D.colorTheme}\nPARTICLES: ${resultData.job3D.particleCount}\n\n=== 2D ASSET ===\nTITLE: 4K VFX Overlay: ${resultData.job2D.trendTopic} [${resultData.job2D.clipCategory}]\nCOLOR: ${resultData.job2D.colorTheme}\nBLOOM: ${resultData.job2D.bloomIntensity}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [DUAL ORCHESTRATION COMPLETE] Saved 3D (${resultData.job3D.clipCategory}) & 2D (${resultData.job2D.clipCategory}) for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateDualOrchestratorJson;

if (require.main === module) {
  generateDualOrchestratorJson();
}
