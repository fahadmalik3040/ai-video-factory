import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function generate2DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [2D Ultra Motion Director] Generating specialized 2D Archetype for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const archetypes = [
    "cyber_matrix_telemetry",
    "organic_liquid_prism",
    "parametric_audio_equalizer",
    "kinetic_bauhaus_grid",
    "neon_data_vortex",
    "holographic_neural_synapse"
  ];
  const chosenArchetype = archetypes[Math.abs(jobIndex) % archetypes.length];

  let result2D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Archetype candidate: "${chosenArchetype}".
Generate an elite, 100% PURE VISUAL (ZERO TEXT, ZERO LETTERS, ZERO NUMBERS) 2D motion graphics configuration.
Select the most fitting visual archetype for "${promptContent}" from:
["cyber_matrix_telemetry", "organic_liquid_prism", "parametric_audio_equalizer", "kinetic_bauhaus_grid", "neon_data_vortex", "holographic_neural_synapse"]

Return STRICT JSON:
{
  "seoPackage": {
    "title": "4K Abstract 2D Motion Graphics: ${promptContent}",
    "description": "Pure visual mathematical motion design for ${promptContent}",
    "seoTags": ["2d motion graphics", "abstract", "4k", "hud", "mograph", "vfx overlay", "${promptContent.toLowerCase()}"]
  },
  "engine2D": {
    "layoutStructure": "cyber_matrix_telemetry" | "organic_liquid_prism" | "parametric_audio_equalizer" | "kinetic_bauhaus_grid" | "neon_data_vortex" | "holographic_neural_synapse",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "energySpeed": 1.0,
    "complexity": 1.0,
    "glowIntensity": 2.5,
    "elements": [
      { "type": "data_ring" | "glass_blob" | "hud_grid" | "waveform_bars" | "neural_synapse" | "kinetic_matrix", "scale": 1.0, "thickness": 3, "size": 400, "rows": 6, "cols": 8 }
    ]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite 2D Motion Graphics Art Director. STRICT MANDATE: Generate PURE ABSTRACT VISUAL MOTION GRAPHICS with ZERO text, zero numbers, and zero letters. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.engine2D && parsed.engine2D.layoutStructure) {
      result2D = parsed;
      console.log(`✅ [2D Director] LLM generated 2D Archetype: ${parsed.engine2D.layoutStructure}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [2D Director] Falling back to high-entropy mathematical procedural 2D config:`, err.message);
  }

  if (!result2D) {
    result2D = {
      seoPackage: {
        title: `Cinematic 4K 2D Mograph: ${promptContent}`,
        description: `Ultra-clean abstract 2D procedural motion graphics of ${promptContent}`,
        seoTags: ["2d mograph", "motion graphics", "4k", "abstract", "hud", "pure visual", promptContent.toLowerCase()]
      },
      engine2D: {
        layoutStructure: chosenArchetype,
        colorPalette: dynamicPalette,
        energySpeed: 1.0 + ((Math.abs(jobIndex) % 5) * 0.15),
        complexity: 1.0 + ((Math.abs(jobIndex) % 4) * 0.2),
        glowIntensity: 2.5,
        elements: [
          { type: "data_ring", scale: 1.0, thickness: 3 },
          { type: "glass_blob", size: 380 },
          { type: "hud_grid", rows: 5, cols: 8 },
          { type: "waveform_bars", scale: 1.0 }
        ]
      }
    };
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(result2D, null, 2));
  fs.writeFileSync(`data/metadata_2d.json`, JSON.stringify(result2D, null, 2));
  return result2D;
}

if (require.main === module) {
  generate2DMetadata();
}
