import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function generate3DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎥 [3D Technical Director] Constructing Advanced 3D Scene for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const geoms = ["TorusKnotGeometry", "IcosahedronGeometry", "TorusGeometry", "CylinderGeometry", "SphereGeometry", "BoxGeometry"];
  const layouts = ["fibonacci_sphere", "concentric_rings", "dna_helix", "wave_plane", "grid"];
  const cameraPaths = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];

  const chosenGeom = geoms[Math.abs(jobIndex) % geoms.length];
  const chosenLayout = layouts[Math.abs(jobIndex) % layouts.length];
  const chosenCam = cameraPaths[Math.abs(jobIndex) % cameraPaths.length];

  let result3D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Chosen Core Geometry: "${chosenGeom}".
Chosen Instancing Layout: "${chosenLayout}".
Chosen Camera Path: "${chosenCam}".

You are an Elite 3D Technical Director for Adobe Stock. You construct cinematic, abstract mathematical visual structures.
Generate an ultra-detailed, professional-grade 3D VFX configuration conforming to this STRICT JSON schema:

{
  "seoPackage": {
    "title": "Cinematic 4K Solid 3D: ${promptContent}",
    "description": "Procedural 3D solid geometry mathematical simulation of ${promptContent}",
    "seoTags": ["3d", "procedural", "4k", "stock video", "pbr", "octane render", "redshift", "blender", "${promptContent.toLowerCase()}"]
  },
  "coreGeometry": {
    "type": "TorusKnotGeometry" | "IcosahedronGeometry" | "TorusGeometry" | "CylinderGeometry" | "SphereGeometry" | "BoxGeometry",
    "args": [1, 0.3, 128, 64]
  },
  "instancingMath": {
    "layout": "fibonacci_sphere" | "concentric_rings" | "dna_helix" | "wave_plane" | "grid",
    "count": 240,
    "spreadRadius": 14
  },
  "cinematicLighting": {
    "ambientHex": "${dynamicPalette[0]}",
    "ambientIntensity": 0.8,
    "directionalHex": "#ffffff",
    "directionalIntensity": 2.5,
    "directionalPosition": [10, 15, 8],
    "pointLightHex": "${dynamicPalette[1]}",
    "pointLightIntensity": 4.5
  },
  "pbrMaterial": {
    "color": "#111420",
    "metalness": 0.95,
    "roughness": 0.08,
    "clearcoat": 1.0,
    "transmission": 0.0
  },
  "virtualCamera": {
    "lensFOV": 40,
    "motionPath": "slow_orbit" | "smooth_dolly_in" | "macro_pan_up",
    "depthOfFieldBlur": true,
    "focusDistance": 0
  },
  "engine3D": {
    "solidGeometry": "TorusKnotGeometry" | "IcosahedronGeometry" | "TorusGeometry" | "CylinderGeometry" | "SphereGeometry" | "BoxGeometry",
    "layoutMath": "fibonacci_sphere" | "concentric_rings" | "dna_helix" | "wave_plane" | "grid",
    "physicalMaterial": { "metalness": 0.95, "roughness": 0.08 },
    "cinematographyDP": {
      "cameraPath": "slow_orbit" | "smooth_dolly_in" | "macro_pan_up",
      "pacing": "extremely_slow_and_cinematic",
      "focusDistance": 0
    },
    "colors": ["${dynamicPalette[0]}", "${dynamicPalette[1]}", "${dynamicPalette[2]}"],
    "cameraSpeed": 1.0,
    "bloomIntensity": 2.2,
    "complexity": 1.2
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite 3D Technical Director for Adobe Stock. You construct cinematic, abstract mathematical visual structures. Output STRICT JSON only.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed) {
      result3D = parsed;
      console.log(`✅ [3D Director] Generated: ${parsed.coreGeometry?.type || parsed.engine3D?.solidGeometry}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [3D Director] Falling back to procedural advanced 3D config:`, err.message);
  }

  if (!result3D) {
    result3D = {
      seoPackage: {
        title: `Cinematic 4K Solid 3D: ${promptContent}`,
        description: `Procedural 3D solid geometry mathematical simulation of ${promptContent}`,
        seoTags: ["3d", "procedural", "4k", "stock video", "pbr", "octane render", "cinema4d", promptContent.toLowerCase()]
      },
      coreGeometry: {
        type: chosenGeom,
        args: chosenGeom === 'TorusKnotGeometry' ? [1, 0.3, 128, 64] : [1, 32, 32]
      },
      instancingMath: {
        layout: chosenLayout,
        count: 240,
        spreadRadius: 14
      },
      cinematicLighting: {
        ambientHex: dynamicPalette[0],
        ambientIntensity: 0.8,
        directionalHex: "#ffffff",
        directionalIntensity: 2.5,
        directionalPosition: [10, 15, 8],
        pointLightHex: dynamicPalette[1],
        pointLightIntensity: 4.5
      },
      pbrMaterial: {
        color: "#111420",
        metalness: 0.95,
        roughness: 0.08,
        clearcoat: 1.0,
        transmission: 0.0
      },
      virtualCamera: {
        lensFOV: 40,
        motionPath: chosenCam,
        depthOfFieldBlur: true,
        focusDistance: 0
      },
      engine3D: {
        solidGeometry: chosenGeom,
        layoutMath: chosenLayout,
        physicalMaterial: { metalness: 0.95, roughness: 0.08 },
        cinematographyDP: {
          cameraPath: chosenCam,
          pacing: "extremely_slow_and_cinematic",
          focusDistance: 0
        },
        colors: dynamicPalette.slice(0, 3),
        cameraSpeed: 1.0,
        bloomIntensity: 2.2,
        complexity: 1.2
      }
    };
  }

  // Ensure seamless property mirroring
  if (!result3D.engine3D) {
    result3D.engine3D = {
      solidGeometry: result3D.coreGeometry?.type || chosenGeom,
      layoutMath: result3D.instancingMath?.layout || chosenLayout,
      physicalMaterial: result3D.pbrMaterial || { metalness: 0.95, roughness: 0.08 },
      cinematographyDP: {
        cameraPath: result3D.virtualCamera?.motionPath || chosenCam,
        pacing: "extremely_slow_and_cinematic",
        focusDistance: 0
      },
      colors: dynamicPalette.slice(0, 3),
      cameraSpeed: 1.0,
      bloomIntensity: 2.2,
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
