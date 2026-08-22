import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';
import { GLSL_CATEGORIES, GLSLVfxCategory, DEFAULT_GLSL_SHADERS } from './generate_3d_swarm';

export async function run2DAISwarm(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [GLSL 2D Director] Designing Pure GLSL Shader Overlay for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  const chosenCat: GLSLVfxCategory = GLSL_CATEGORIES[Math.abs(jobIndex + 1) % GLSL_CATEGORIES.length];

  let result2D: any = null;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Suggested Category: "${chosenCat}".

You are an Elite GLSL 2D Shader Engineer for Adobe Stock & Premiere Pro overlays. Select the best shader category ("chemical_reaction" | "liquid_fire" | "quantum_waterfall" | "plasma_storm") and uniform parameters.

Output STRICT JSON:
{
  "vfxCategory": "chemical_reaction" | "liquid_fire" | "quantum_waterfall" | "plasma_storm",
  "uniforms": {
    "color1": "${dynamicPalette[1]}",
    "color2": "${dynamicPalette[2]}",
    "speed": 1.2,
    "density": 2.8
  },
  "seoPackage": {
    "title": "4K GLSL Motion Overlay: ${promptTopic} - ${chosenCat.replace(/_/g, ' ').toUpperCase()}",
    "description": "Pure mathematical GLSL fluid and plasma shader backdrop for ${promptTopic}.",
    "seoTags": ["glsl overlay", "shader overlay", "4k stock", "plasma", "fluid", "${chosenCat}", "${promptTopic.toLowerCase()}"]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are an Elite GLSL Shader Engineer. Output STRICT JSON only."
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.vfxCategory) {
      result2D = parsed;
      console.log(`✅ [2D GLSL Director] Selected Category: ${parsed.vfxCategory}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [2D GLSL Director] Using verified Shadertoy GLSL fallback:`, err.message);
  }

  if (!result2D) {
    result2D = {
      vfxCategory: chosenCat,
      uniforms: {
        color1: dynamicPalette[1],
        color2: dynamicPalette[2],
        speed: 1.2,
        density: 2.8
      },
      seoPackage: {
        title: `4K GLSL Motion Overlay: ${promptTopic} - ${chosenCat.replace(/_/g, ' ').toUpperCase()}`,
        description: `Pure mathematical GLSL fluid and plasma shader backdrop for ${promptTopic}.`,
        seoTags: ["glsl overlay", "shader overlay", "4k stock", "plasma", "fluid", chosenCat, promptTopic.toLowerCase()]
      }
    };
  }

  const category = (result2D.vfxCategory as GLSLVfxCategory) || chosenCat;
  result2D.glslFragmentShader = DEFAULT_GLSL_SHADERS[category] || DEFAULT_GLSL_SHADERS.plasma_storm;
  result2D.colors = [result2D.uniforms.color1, result2D.uniforms.color2];

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(result2D, null, 2));
  fs.writeFileSync(`data/metadata_2d.json`, JSON.stringify(result2D, null, 2));
  fs.writeFileSync(`data/master_2d_payload.json`, JSON.stringify(result2D, null, 2));

  return result2D;
}

if (require.main === module) {
  run2DAISwarm();
}
