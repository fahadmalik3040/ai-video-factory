import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';
import { generateProceduralGLSL } from '../engine/shaders/defaultShaders';

export { generateProceduralGLSL };

export interface InfiniteGLSLPayload {
  commercialConcept: string;
  glslFragmentShader: string;
  seed: number;
  uniforms: {
    u_colorPrimary: string;
    u_colorSecondary: string;
    u_speed: number;
  };
  engine2DOverlay: {
    overlayType: 'glitch_artifacts' | 'cinematic_light_leak' | 'cyberpunk_hud_svg';
    blendMode: 'screen' | 'color-dodge';
    opacity: number;
  };
  seoPackage: {
    title: string;
    description: string;
    seoTags: string[];
  };
  colors: string[];
}

export async function run3DAISwarm(topic?: string, jobIdx?: number): Promise<InfiniteGLSLPayload> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seedString = Math.random().toString(36).substring(7);
  const mathSeed = Math.floor(Math.random() * 10000) + 1;
  console.log(`🌌 [Infinite GLSL Engine] Synthesizing Bespoke GPU Shader for: "${promptTopic}" (Job ${jobIndex}, Seed: ${mathSeed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seedString);
  let payload: InfiniteGLSLPayload | null = null;

  const systemPrompt = `You are an autonomous JSON script generator and World-Class Shadertoy GLSL Shader Engineer. Output STRICT JSON only.
You write pure mathematical GLSL fragment shaders (raymarching, fractional brownian motion, domain warping, or cellular noise) that visualize any concept on a fullscreen GPU canvas.

STRICT MANDATES:
1. The 'glslFragmentShader' MUST be 100% valid GLSL code that compiles without errors.
2. It MUST use these exact uniforms:
   - uniform float u_time;
   - uniform vec2 u_resolution;
   - uniform vec3 u_colorPrimary;
   - uniform vec3 u_colorSecondary;
   - uniform float u_speed;
3. Output STRICT JSON conforming to the requested schema. MAKE SURE to generate a random 'seed' number between 1 and 10000.`;

  const userPrompt = `UNIQUE HASH: ${Date.now()}-${mathSeed}.
Topic: "${promptTopic}".
Primary Color: "${dynamicPalette[0]}".
Secondary Color: "${dynamicPalette[1]}".

Generate a completely custom, bespoke GLSL fragment shader and overlay configuration for "${promptTopic}".

JSON SCHEMA:
{
  "commercialConcept": "How this specific shader visualizes ${promptTopic} for commercial video editors",
  "seed": ${mathSeed},
  "glslFragmentShader": "string containing complete GLSL code...",
  "uniforms": {
    "u_colorPrimary": "${dynamicPalette[0]}",
    "u_colorSecondary": "${dynamicPalette[1]}",
    "u_speed": 1.4
  },
  "engine2DOverlay": {
    "overlayType": "glitch_artifacts" | "cinematic_light_leak" | "cyberpunk_hud_svg",
    "blendMode": "screen" | "color-dodge",
    "opacity": 0.85
  },
  "seoPackage": {
    "title": "4K Stock VFX: ${promptTopic} | Procedural GLSL Shader",
    "description": "Bespoke GPU shader mathematical simulation of ${promptTopic} for commercial video editors.",
    "seoTags": ["glsl", "shader", "4k stock", "procedural", "vfx", "${promptTopic.toLowerCase()}"]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.glslFragmentShader && parsed.uniforms) {
      payload = {
        ...parsed,
        seed: parsed.seed || mathSeed
      };
      console.log(`✅ [Infinite GLSL Engine] LLM Generated Bespoke Shader (${parsed.commercialConcept?.slice(0, 60)}...)`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Infinite GLSL Engine] Falling back to procedural mathematical GLSL synthesizer:`, err.message);
  }

  if (!payload) {
    const proceduralShader = generateProceduralGLSL(promptTopic, seedString);
    const overlayTypes: InfiniteGLSLPayload['engine2DOverlay']['overlayType'][] = [
      'cinematic_light_leak',
      'glitch_artifacts',
      'cyberpunk_hud_svg'
    ];
    const chosenOverlay = overlayTypes[Math.abs(jobIndex) % overlayTypes.length];

    payload = {
      commercialConcept: `Procedural mathematical GPU fluid and raymarched field visualizing ${promptTopic}`,
      seed: mathSeed,
      glslFragmentShader: proceduralShader,
      uniforms: {
        u_colorPrimary: dynamicPalette[0],
        u_colorSecondary: dynamicPalette[1],
        u_speed: 1.4
      },
      engine2DOverlay: {
        overlayType: chosenOverlay,
        blendMode: 'screen',
        opacity: 0.85
      },
      seoPackage: {
        title: `4K Stock VFX: ${promptTopic} | Procedural GLSL Shader`,
        description: `Bespoke GPU shader mathematical simulation of ${promptTopic} for commercial video editors.`,
        seoTags: ["glsl", "shader", "4k stock", "procedural", "vfx", promptTopic.toLowerCase()]
      },
      colors: [dynamicPalette[0], dynamicPalette[1]]
    };
  }

  payload.colors = [payload.uniforms.u_colorPrimary, payload.uniforms.u_colorSecondary];

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/master_3d_payload.json`, JSON.stringify(payload, null, 2));

  return payload;
}

if (require.main === module) {
  run3DAISwarm();
}
