import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';
import { generateProceduralGLSL, InfiniteGLSLPayload } from './generate_3d_swarm';

export async function run2DAISwarm(topic?: string, jobIdx?: number): Promise<InfiniteGLSLPayload> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [Infinite 2D GLSL Engine] Synthesizing Bespoke 2D Shader & Overlay for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  let payload: InfiniteGLSLPayload | null = null;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Primary Color: "${dynamicPalette[1]}".
Secondary Color: "${dynamicPalette[2]}".

Generate a completely custom, bespoke GLSL fragment shader and 2D overlay configuration for "${promptTopic}".

JSON SCHEMA:
{
  "commercialConcept": "How this specific 2D visual overlay visualizes ${promptTopic} for video editors",
  "glslFragmentShader": "string containing complete GLSL code...",
  "uniforms": {
    "u_colorPrimary": "${dynamicPalette[1]}",
    "u_colorSecondary": "${dynamicPalette[2]}",
    "u_speed": 1.2
  },
  "engine2DOverlay": {
    "overlayType": "glitch_artifacts" | "cinematic_light_leak" | "cyberpunk_hud_svg",
    "blendMode": "screen" | "color-dodge",
    "opacity": 0.9
  },
  "seoPackage": {
    "title": "4K Motion Overlay: ${promptTopic} | Procedural GLSL VFX",
    "description": "Bespoke GPU shader mathematical overlay for ${promptTopic}.",
    "seoTags": ["glsl overlay", "shader overlay", "4k stock", "procedural", promptTopic.toLowerCase()]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are an Elite GLSL 2D Shader Engineer for Adobe Stock & Premiere Pro overlays. Output STRICT JSON only."
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.glslFragmentShader && parsed.uniforms) {
      payload = parsed;
      console.log(`✅ [Infinite 2D GLSL Engine] LLM Generated Bespoke 2D Shader`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Infinite 2D GLSL Engine] Using procedural mathematical GLSL fallback:`, err.message);
  }

  if (!payload) {
    const proceduralShader = generateProceduralGLSL(promptTopic, seed);
    const overlayTypes: InfiniteGLSLPayload['engine2DOverlay']['overlayType'][] = [
      'glitch_artifacts',
      'cinematic_light_leak',
      'cyberpunk_hud_svg'
    ];
    const chosenOverlay = overlayTypes[Math.abs(jobIndex + 1) % overlayTypes.length];

    payload = {
      commercialConcept: `Procedural mathematical GPU fluid and overlay visualizing ${promptTopic}`,
      glslFragmentShader: proceduralShader,
      uniforms: {
        u_colorPrimary: dynamicPalette[1],
        u_colorSecondary: dynamicPalette[2],
        u_speed: 1.2
      },
      engine2DOverlay: {
        overlayType: chosenOverlay,
        blendMode: 'screen',
        opacity: 0.9
      },
      seoPackage: {
        title: `4K Motion Overlay: ${promptTopic} | Procedural GLSL VFX`,
        description: `Bespoke GPU shader mathematical overlay for ${promptTopic}.`,
        seoTags: ["glsl overlay", "shader overlay", "4k stock", "procedural", promptTopic.toLowerCase()]
      },
      colors: [dynamicPalette[1], dynamicPalette[2]]
    };
  }

  payload.colors = [payload.uniforms.u_colorPrimary, payload.uniforms.u_colorSecondary];

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/metadata_2d.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/master_2d_payload.json`, JSON.stringify(payload, null, 2));

  return payload;
}

if (require.main === module) {
  run2DAISwarm();
}
