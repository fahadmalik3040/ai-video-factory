import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function generate3DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎥 [Multi-Layer 3D VFX Director] Generating Layer-Based Scene for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const bgGeoms = ["InfiniteGrid", "DataWaves", "BinaryTunnel"];
  const heroGeoms = ["TorusKnot", "ParametricTubes", "FractalIcosahedron"];
  const heroMats = ["frosted_glass", "liquid_metal", "glowing_plasma"];
  const accentGeoms = ["DataCubes", "TechRings"];
  const camStyles = ["slow_macro_dolly", "slow_orbit", "smooth_dolly_in", "macro_pan_up"];

  const chosenBg = bgGeoms[Math.abs(jobIndex) % bgGeoms.length];
  const chosenHero = heroGeoms[Math.abs(jobIndex) % heroGeoms.length];
  const chosenHeroMat = heroMats[Math.abs(jobIndex) % heroMats.length];
  const chosenAccent = accentGeoms[Math.abs(jobIndex) % accentGeoms.length];
  const chosenCam = camStyles[Math.abs(jobIndex) % camStyles.length];

  let result3D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Chosen Background: "${chosenBg}".
Chosen Hero Subject: "${chosenHero}" with "${chosenHeroMat}".
Chosen Accents: "${chosenAccent}".

You are an Elite 3D Technical Director for Adobe Stock. You construct layered cinematic abstract visual structures with heavy post-processing.
Generate an ultra-detailed Multi-Layer Composition configuration conforming to this STRICT JSON schema:

{
  "seoPackage": {
    "title": "Cinematic 4K Multi-Layer 3D VFX: ${promptContent}",
    "description": "Multi-layer procedural 3D solid geometry simulation of ${promptContent} with cinematic post-processing",
    "seoTags": ["3d", "procedural", "4k", "stock video", "vfx", "multi-layer", "redshift", "octane", "${promptContent.toLowerCase()}"]
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
    "motionStyle": "slow_macro_dolly" | "slow_orbit" | "smooth_dolly_in" | "macro_pan_up",
    "motionPath": "slow_macro_dolly" | "slow_orbit" | "smooth_dolly_in" | "macro_pan_up"
  },
  "compositionLayers": [
    {
      "role": "Background_Environment",
      "geometry": "InfiniteGrid" | "DataWaves" | "BinaryTunnel",
      "materialStyle": "neon_wireframe" | "dark_matte",
      "color": "${dynamicPalette[0]}"
    },
    {
      "role": "Hero_Subject",
      "geometry": "TorusKnot" | "ParametricTubes" | "FractalIcosahedron",
      "materialStyle": "frosted_glass" | "liquid_metal" | "glowing_plasma",
      "color": "${dynamicPalette[1]}",
      "scale": 1.6
    },
    {
      "role": "Floating_Accents",
      "geometry": "DataCubes" | "TechRings",
      "materialStyle": "pure_emission",
      "color": "${dynamicPalette[2]}",
      "instancedCount": 150
    }
  ],
  "engine3D": {
    "solidGeometry": "TorusKnotGeometry",
    "layoutMath": "multi_layer_composition",
    "colors": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}"],
    "cameraSpeed": 1.0,
    "bloomIntensity": 2.5,
    "complexity": 1.2
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite 3D Technical Director for Adobe Stock. You construct multi-layer cinematic visual structures. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed) {
      result3D = parsed;
      console.log(`✅ [3D Director] Generated Multi-Layer Composition with ${parsed.compositionLayers?.length || 3} layers.`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [3D Director] Falling back to procedural multi-layer 3D config:`, err.message);
  }

  if (!result3D) {
    result3D = {
      seoPackage: {
        title: `Cinematic 4K Multi-Layer 3D VFX: ${promptContent}`,
        description: `Multi-layer procedural 3D solid geometry simulation of ${promptContent} with cinematic post-processing`,
        seoTags: ["3d", "procedural", "4k", "stock video", "vfx", "multi-layer", "redshift", "octane", promptContent.toLowerCase()]
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
        motionStyle: chosenCam,
        motionPath: chosenCam
      },
      compositionLayers: [
        {
          role: "Background_Environment",
          geometry: chosenBg,
          materialStyle: "neon_wireframe",
          color: dynamicPalette[0]
        },
        {
          role: "Hero_Subject",
          geometry: chosenHero,
          materialStyle: chosenHeroMat,
          color: dynamicPalette[1],
          scale: 1.6
        },
        {
          role: "Floating_Accents",
          geometry: chosenAccent,
          materialStyle: "pure_emission",
          color: dynamicPalette[2],
          instancedCount: 150
        }
      ],
      engine3D: {
        solidGeometry: chosenHero,
        layoutMath: "multi_layer_composition",
        colors: dynamicPalette.slice(0, 3),
        cameraSpeed: 1.0,
        bloomIntensity: 2.5,
        complexity: 1.2
      }
    };
  }

  // Ensure engine3D alias compatibility
  if (!result3D.engine3D) {
    result3D.engine3D = {
      solidGeometry: result3D.compositionLayers?.find((l: any) => l.role === "Hero_Subject")?.geometry || chosenHero,
      layoutMath: "multi_layer_composition",
      colors: dynamicPalette.slice(0, 3),
      cameraSpeed: 1.0,
      bloomIntensity: result3D.cinematicVFX?.bloomIntensity || 2.5,
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
