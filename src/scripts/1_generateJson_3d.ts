import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export const COMMERCIAL_CATEGORIES = [
  "fiber_optic_data_flow",
  "abstract_clean_waves",
  "biotech_microscopic",
  "cyberpunk_hacker_hud",
  "glassmorphism_corporate_ui",
  "crypto_blockchain_nodes"
] as const;

export type CommercialMarketCategory = typeof COMMERCIAL_CATEGORIES[number];

export async function generate3DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎥 [Commercial Stock 3D Director] Generating Market-Ready Scene for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const chosenCategory = COMMERCIAL_CATEGORIES[Math.abs(jobIndex) % COMMERCIAL_CATEGORIES.length];

  // Map category to best-selling layer geometries & materials
  const categoryPresets: Record<CommercialMarketCategory, { bg: string; hero: string; heroMat: string; accent: string }> = {
    fiber_optic_data_flow: { bg: "BinaryTunnel", hero: "ParametricTubes", heroMat: "glowing_plasma", accent: "DataCubes" },
    abstract_clean_waves: { bg: "DataWaves", hero: "TorusKnot", heroMat: "liquid_metal", accent: "DataCubes" },
    biotech_microscopic: { bg: "InfiniteGrid", hero: "FractalIcosahedron", heroMat: "frosted_glass", accent: "TechRings" },
    cyberpunk_hacker_hud: { bg: "BinaryTunnel", hero: "TorusKnot", heroMat: "glowing_plasma", accent: "TechRings" },
    glassmorphism_corporate_ui: { bg: "DataWaves", hero: "TorusKnot", heroMat: "frosted_glass", accent: "TechRings" },
    crypto_blockchain_nodes: { bg: "InfiniteGrid", hero: "FractalIcosahedron", heroMat: "liquid_metal", accent: "DataCubes" }
  };

  const preset = categoryPresets[chosenCategory];
  let result3D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Commercial Market Category candidate: "${chosenCategory}".

You are an Elite Commercial Stock Video Producer for Adobe Stock, Shutterstock, and Pond5. Video editors buy clean, high-utility, structured stock footage. You MUST constrain all procedural math to top-selling commercial categories.

Generate a market-ready 3D VFX configuration conforming to this STRICT JSON schema:

{
  "commercialMarketCategory": "fiber_optic_data_flow" | "abstract_clean_waves" | "biotech_microscopic" | "cyberpunk_hacker_hud" | "glassmorphism_corporate_ui" | "crypto_blockchain_nodes",
  "visualStructure": {
    "primaryElementLayout": "string (e.g., 'interlocking glowing network nodes and fiber optic streams')",
    "complexityLevel": 7
  },
  "commercialColors": {
    "primaryTechGlow": "${dynamicPalette[0]}",
    "backgroundAmbiance": "#04050d",
    "accentHighlight": "${dynamicPalette[1]}"
  },
  "cinematicEditorNeeds": {
    "cameraPacing": "ultra_slow_continuous",
    "depthOfField": "heavy_bokeh",
    "negativeSpace": "left_side_open_for_text"
  },
  "seoPackage": {
    "title": "4K Stock Footage: ${promptContent} - ${chosenCategory.replace(/_/g, ' ').toUpperCase()}",
    "description": "High-end commercial stock footage and 3D visual backdrop of ${promptContent} tailored for video editors.",
    "seoTags": ["stock footage", "4k", "commercial", "b-roll", "adobe stock", "video editing", "${chosenCategory.replace(/_/g, ' ')}", "${promptContent.toLowerCase()}"]
  },
  "cinematicVFX": {
    "bloomIntensity": 2.5,
    "chromaticAberrationOffset": 0.005,
    "noiseOpacity": 0.04,
    "vignette": true
  },
  "environment": {
    "bgColor": "#04050d",
    "fogColor": "#04050d",
    "fogDensity": 0.025
  },
  "cameraDP": {
    "fov": 30,
    "motionStyle": "slow_macro_dolly"
  },
  "compositionLayers": [
    {
      "role": "Background_Environment",
      "geometry": "${preset.bg}",
      "materialStyle": "neon_wireframe",
      "color": "${dynamicPalette[0]}"
    },
    {
      "role": "Hero_Subject",
      "geometry": "${preset.hero}",
      "materialStyle": "${preset.heroMat}",
      "color": "${dynamicPalette[1]}",
      "scale": 1.6
    },
    {
      "role": "Floating_Accents",
      "geometry": "${preset.accent}",
      "materialStyle": "pure_emission",
      "color": "${dynamicPalette[2]}",
      "instancedCount": 150
    }
  ]
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite Commercial Stock Video Producer for Adobe Stock. You construct strictly commercial, high-selling stock video backdrops. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.commercialMarketCategory) {
      result3D = parsed;
      console.log(`✅ [3D Director] Commercial Category Selected: ${parsed.commercialMarketCategory}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [3D Director] Falling back to procedural commercial 3D config:`, err.message);
  }

  if (!result3D) {
    result3D = {
      commercialMarketCategory: chosenCategory,
      visualStructure: {
        primaryElementLayout: `Interlocking structured ${chosenCategory.replace(/_/g, ' ')} elements with clean composition`,
        complexityLevel: 7
      },
      commercialColors: {
        primaryTechGlow: dynamicPalette[0],
        backgroundAmbiance: "#04050d",
        accentHighlight: dynamicPalette[1]
      },
      cinematicEditorNeeds: {
        cameraPacing: "ultra_slow_continuous",
        depthOfField: "heavy_bokeh",
        negativeSpace: "left_side_open_for_text"
      },
      seoPackage: {
        title: `4K Stock Footage: ${promptContent} - ${chosenCategory.replace(/_/g, ' ').toUpperCase()}`,
        description: `High-end commercial stock footage and 3D visual backdrop of ${promptContent} tailored for video editors.`,
        seoTags: ["stock footage", "4k", "commercial", "b-roll", "adobe stock", "video editing", chosenCategory.replace(/_/g, ' '), promptContent.toLowerCase()]
      },
      cinematicVFX: {
        bloomIntensity: 2.5,
        chromaticAberrationOffset: 0.005,
        noiseOpacity: 0.04,
        vignette: true
      },
      environment: {
        bgColor: "#04050d",
        fogColor: "#04050d",
        fogDensity: 0.025
      },
      cameraDP: {
        fov: 30,
        motionStyle: "slow_macro_dolly"
      },
      compositionLayers: [
        {
          role: "Background_Environment",
          geometry: preset.bg,
          materialStyle: "neon_wireframe",
          color: dynamicPalette[0]
        },
        {
          role: "Hero_Subject",
          geometry: preset.hero,
          materialStyle: preset.heroMat,
          color: dynamicPalette[1],
          scale: 1.6
        },
        {
          role: "Floating_Accents",
          geometry: preset.accent,
          materialStyle: "pure_emission",
          color: dynamicPalette[2],
          instancedCount: 150
        }
      ]
    };
  }

  // Ensure engine3D alias compatibility
  if (!result3D.engine3D) {
    result3D.engine3D = {
      solidGeometry: result3D.compositionLayers?.find((l: any) => l.role === "Hero_Subject")?.geometry || preset.hero,
      layoutMath: "multi_layer_composition",
      colors: [result3D.commercialColors?.primaryTechGlow || dynamicPalette[0], result3D.commercialColors?.accentHighlight || dynamicPalette[1], dynamicPalette[2]],
      cameraSpeed: 1.0,
      bloomIntensity: 2.5,
      complexity: 1.2
    };
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(result3D, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(result3D, null, 2));
  return result3D;
}

if (require.main === module) {
  generate3DMetadata();
}
