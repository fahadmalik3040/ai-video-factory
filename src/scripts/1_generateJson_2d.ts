import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function generate2DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [2D Art Director] Designing Intricate Motion Graphics for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

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
Chosen Visual Archetype: "${chosenArchetype}".

You are an Elite 2D Motion Graphics & HUD Art Director for Adobe Stock and After Effects template design. You construct intricate, purely visual abstract mathematical UI, HUD, and holographic graphics with ZERO text, ZERO numbers, and ZERO letters.
Generate an ultra-detailed 2D motion graphics configuration conforming to this STRICT JSON schema:

{
  "seoPackage": {
    "title": "4K Abstract 2D Motion Graphics: ${promptContent}",
    "description": "Pure visual mathematical motion design and HUD telemetry for ${promptContent}",
    "seoTags": ["2d motion graphics", "abstract", "4k", "hud", "mograph", "vfx overlay", "after effects", "quantum", "${promptContent.toLowerCase()}"]
  },
  "visualArchetype": {
    "name": "cyber_matrix_telemetry" | "organic_liquid_prism" | "parametric_audio_equalizer" | "kinetic_bauhaus_grid" | "neon_data_vortex" | "holographic_neural_synapse",
    "colorPalette": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}", "${dynamicPalette[3]}"],
    "particlePhysics": { "count": 64, "speed": 1.2, "glowIntensity": 3.0, "turbulence": 0.5 },
    "hudTelemetry": { "radarSegments": 8, "gridDensity": 24, "scanlineSpeed": 1.5, "laserPulse": true },
    "glassmorphism": { "blur": 40, "refractionOpacity": 0.25, "chromaticBorder": "${dynamicPalette[1]}" }
  },
  "engine2D": {
    "layoutStructure": "cyber_matrix_telemetry" | "organic_liquid_prism" | "parametric_audio_equalizer" | "kinetic_bauhaus_grid" | "neon_data_vortex" | "holographic_neural_synapse",
    "colorPalette": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}", "${dynamicPalette[3]}"],
    "energySpeed": 1.1,
    "complexity": 1.3,
    "glowIntensity": 2.8,
    "elements": [
      { "type": "data_ring", "scale": 1.0, "thickness": 3 },
      { "type": "glass_blob", "size": 420 },
      { "type": "hud_grid", "rows": 6, "cols": 8 },
      { "type": "waveform_bars", "scale": 1.1 }
    ]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite 2D Motion Graphics & HUD Art Director for Adobe Stock. STRICT MANDATE: Generate PURE ABSTRACT VISUAL MOTION GRAPHICS with ZERO text, zero numbers, and zero letters. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed) {
      result2D = parsed;
      console.log(`✅ [2D Director] Generated Archetype: ${parsed.visualArchetype?.name || parsed.engine2D?.layoutStructure}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [2D Director] Falling back to procedural advanced 2D config:`, err.message);
  }

  if (!result2D) {
    result2D = {
      seoPackage: {
        title: `Cinematic 4K 2D Mograph: ${promptContent}`,
        description: `Ultra-clean abstract 2D procedural motion graphics of ${promptContent}`,
        seoTags: ["2d mograph", "motion graphics", "4k", "abstract", "hud", "pure visual", promptContent.toLowerCase()]
      },
      visualArchetype: {
        name: chosenArchetype,
        colorPalette: dynamicPalette,
        particlePhysics: { count: 64, speed: 1.2, glowIntensity: 3.0, turbulence: 0.5 },
        hudTelemetry: { radarSegments: 8, gridDensity: 24, scanlineSpeed: 1.5, laserPulse: true },
        glassmorphism: { blur: 40, refractionOpacity: 0.25, chromaticBorder: dynamicPalette[1] }
      },
      engine2D: {
        layoutStructure: chosenArchetype,
        colorPalette: dynamicPalette,
        energySpeed: 1.0 + ((Math.abs(jobIndex) % 5) * 0.15),
        complexity: 1.0 + ((Math.abs(jobIndex) % 4) * 0.2),
        glowIntensity: 2.8,
        elements: [
          { type: "data_ring", scale: 1.0, thickness: 3 },
          { type: "glass_blob", size: 400 },
          { type: "hud_grid", rows: 5, cols: 8 },
          { type: "waveform_bars", scale: 1.1 }
        ]
      }
    };
  }

  if (!result2D.engine2D) {
    result2D.engine2D = {
      layoutStructure: result2D.visualArchetype?.name || chosenArchetype,
      colorPalette: result2D.visualArchetype?.colorPalette || dynamicPalette,
      energySpeed: 1.2,
      complexity: 1.3,
      glowIntensity: 2.8,
      elements: [
        { type: "data_ring", scale: 1.0, thickness: 3 },
        { type: "glass_blob", size: 400 },
        { type: "hud_grid", rows: 5, cols: 8 },
        { type: "waveform_bars", scale: 1.1 }
      ]
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
