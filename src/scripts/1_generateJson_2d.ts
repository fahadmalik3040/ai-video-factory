import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';
import { COMMERCIAL_CATEGORIES, CommercialMarketCategory } from './1_generateJson_3d';

export async function generate2DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [Commercial 2D Motion Director] Designing Commercial Mograph for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const chosenCategory = COMMERCIAL_CATEGORIES[Math.abs(jobIndex) % COMMERCIAL_CATEGORIES.length];

  const archetypeMap: Record<CommercialMarketCategory, string> = {
    fiber_optic_data_flow: "parametric_audio_equalizer",
    abstract_clean_waves: "organic_liquid_prism",
    biotech_microscopic: "holographic_neural_synapse",
    cyberpunk_hacker_hud: "cyber_matrix_telemetry",
    glassmorphism_corporate_ui: "organic_liquid_prism",
    crypto_blockchain_nodes: "kinetic_bauhaus_grid"
  };

  const chosenArchetype = archetypeMap[chosenCategory] || "cyber_matrix_telemetry";
  let result2D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Commercial Market Category: "${chosenCategory}".
Archetype: "${chosenArchetype}".

You are an Elite 2D Motion Graphics Art Director for commercial video editors (Premiere Pro / After Effects / CapCut templates). You construct structured, high-utility abstract visual graphics with ZERO text, ZERO numbers, and ZERO letters.

Generate a commercial 2D motion graphics configuration conforming to this STRICT JSON schema:

{
  "commercialMarketCategory": "fiber_optic_data_flow" | "abstract_clean_waves" | "biotech_microscopic" | "cyberpunk_hacker_hud" | "glassmorphism_corporate_ui" | "crypto_blockchain_nodes",
  "visualStructure": {
    "primaryElementLayout": "string (e.g., 'radial telemetry rings with clean negative space for lower thirds')",
    "complexityLevel": 7
  },
  "commercialColors": {
    "primaryTechGlow": "${dynamicPalette[0]}",
    "backgroundAmbiance": "#03040a",
    "accentHighlight": "${dynamicPalette[1]}"
  },
  "cinematicEditorNeeds": {
    "cameraPacing": "ultra_slow_continuous",
    "depthOfField": "heavy_bokeh",
    "negativeSpace": "left_side_open_for_text"
  },
  "seoPackage": {
    "title": "4K Commercial 2D Motion Graphics: ${promptContent} - ${chosenCategory.replace(/_/g, ' ').toUpperCase()}",
    "description": "High-utility pure visual 2D motion graphics and overlay backdrop for ${promptContent}.",
    "seoTags": ["2d motion graphics", "commercial", "4k", "hud", "mograph", "vfx overlay", "video editing", "${chosenCategory.replace(/_/g, ' ')}", "${promptContent.toLowerCase()}"]
  },
  "visualArchetype": {
    "name": "${chosenArchetype}",
    "colorPalette": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}", "${dynamicPalette[3]}"],
    "particlePhysics": { "count": 64, "speed": 1.1, "glowIntensity": 2.8 },
    "hudTelemetry": { "radarSegments": 8, "gridDensity": 24, "scanlineSpeed": 1.5 },
    "glassmorphism": { "blur": 40, "refractionOpacity": 0.25 }
  },
  "engine2D": {
    "layoutStructure": "${chosenArchetype}",
    "colorPalette": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}", "${dynamicPalette[3]}"],
    "energySpeed": 1.1,
    "complexity": 1.2,
    "glowIntensity": 2.8,
    "elements": [
      { "type": "data_ring", "scale": 1.0, "thickness": 3 },
      { "type": "glass_blob", "size": 400 },
      { "type": "hud_grid", "rows": 5, "cols": 8 },
      { "type": "waveform_bars", "scale": 1.1 }
    ]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite 2D Motion Graphics Art Director. STRICT MANDATE: Generate PURE ABSTRACT VISUAL MOTION GRAPHICS with ZERO text. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.commercialMarketCategory) {
      result2D = parsed;
      console.log(`✅ [2D Director] Commercial Category Selected: ${parsed.commercialMarketCategory}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [2D Director] Falling back to procedural commercial 2D config:`, err.message);
  }

  if (!result2D) {
    result2D = {
      commercialMarketCategory: chosenCategory,
      visualStructure: {
        primaryElementLayout: `Structured ${chosenCategory.replace(/_/g, ' ')} motion graphics with clean negative space`,
        complexityLevel: 7
      },
      commercialColors: {
        primaryTechGlow: dynamicPalette[0],
        backgroundAmbiance: "#03040a",
        accentHighlight: dynamicPalette[1]
      },
      cinematicEditorNeeds: {
        cameraPacing: "ultra_slow_continuous",
        depthOfField: "heavy_bokeh",
        negativeSpace: "left_side_open_for_text"
      },
      seoPackage: {
        title: `4K Commercial 2D Motion Graphics: ${promptContent} - ${chosenCategory.replace(/_/g, ' ').toUpperCase()}`,
        description: `High-utility pure visual 2D motion graphics and overlay backdrop for ${promptContent}.`,
        seoTags: ["2d motion graphics", "commercial", "4k", "hud", "mograph", "vfx overlay", "video editing", chosenCategory.replace(/_/g, ' '), promptContent.toLowerCase()]
      },
      visualArchetype: {
        name: chosenArchetype,
        colorPalette: dynamicPalette,
        particlePhysics: { count: 64, speed: 1.1, glowIntensity: 2.8 },
        hudTelemetry: { radarSegments: 8, gridDensity: 24, scanlineSpeed: 1.5 },
        glassmorphism: { blur: 40, refractionOpacity: 0.25 }
      },
      engine2D: {
        layoutStructure: chosenArchetype,
        colorPalette: dynamicPalette,
        energySpeed: 1.1,
        complexity: 1.2,
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
      energySpeed: 1.1,
      complexity: 1.2,
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
