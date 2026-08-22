import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function generate3DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptContent, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎥 [3D DP & Geometry Director] Generating 3D Scene for: "${promptContent}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptContent, seed);
  const geoms = ["BoxGeometry", "SphereGeometry", "CylinderGeometry", "TorusGeometry", "IcosahedronGeometry"];
  const maths = ["grid", "concentric_rings", "dna_helix", "wave_plane"];
  const cams = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];

  const chosenGeom = geoms[Math.abs(jobIndex) % geoms.length];
  const chosenMath = maths[Math.abs(jobIndex) % maths.length];
  const chosenCam = cams[Math.abs(jobIndex) % cams.length];

  let result3D: any = null;

  const userPrompt = `Topic: "${promptContent}".
Random Seed: "${seed}".
Generate an elite solid 3D PBR WebGL configuration for Remotion.
Geometry: "${chosenGeom}". Layout: "${chosenMath}". Camera: "${chosenCam}".
Return STRICT JSON:
{
  "seoPackage": {
    "title": "Cinematic 4K Solid 3D: ${promptContent}",
    "description": "Procedural 3D solid geometry simulation of ${promptContent}",
    "seoTags": ["3d", "procedural", "4k", "stock video", "pbr", "${promptContent.toLowerCase()}"]
  },
  "engine3D": {
    "solidGeometry": "BoxGeometry" | "SphereGeometry" | "CylinderGeometry" | "TorusGeometry" | "IcosahedronGeometry",
    "layoutMath": "grid" | "concentric_rings" | "dna_helix" | "wave_plane",
    "physicalMaterial": { "metalness": 0.9, "roughness": 0.1 },
    "cinematographyDP": {
      "cameraPath": "slow_orbit" | "smooth_dolly_in" | "macro_pan_up",
      "pacing": "extremely_slow_and_cinematic",
      "focusDistance": 0
    },
    "colors": ["#hex1", "#hex2", "#hex3"],
    "cameraSpeed": 1.0,
    "bloomIntensity": 2.0,
    "complexity": 1.0
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: `You are an Elite Hollywood DP and 3D Visual Director. Generate STRICT JSON only for a solid 3D WebGL scene.`
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.engine3D) {
      result3D = parsed;
      console.log(`✅ [3D Director] LLM generated 3D Scene: ${parsed.engine3D.solidGeometry} (${parsed.engine3D.layoutMath})`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [3D Director] Falling back to procedural 3D config:`, err.message);
  }

  if (!result3D) {
    result3D = {
      seoPackage: {
        title: `Cinematic 4K Solid 3D: ${promptContent}`,
        description: `Procedural 3D solid geometry simulation of ${promptContent}`,
        seoTags: ["3d", "procedural", "4k", "stock video", "pbr", promptContent.toLowerCase()]
      },
      engine3D: {
        solidGeometry: chosenGeom,
        layoutMath: chosenMath,
        physicalMaterial: { metalness: 0.9, roughness: 0.1 },
        cinematographyDP: {
          cameraPath: chosenCam,
          pacing: "extremely_slow_and_cinematic",
          focusDistance: 0
        },
        colors: dynamicPalette.slice(0, 3),
        cameraSpeed: 1.0,
        bloomIntensity: 2.0,
        complexity: 1.0
      }
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
