import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export interface Agent1Concept {
  conceptTitle: string;
  visualMetaphor: string;
  artisticDirection: string;
  commercialNiche: string;
}

export interface Agent2MathTD {
  particleMath: {
    instancedCount: number;
    spreadRadius: number;
    noiseScale: number;
    velocityVector: [number, number, number];
    rotationalFrequency: number;
    dispersionFormula: string;
  };
  geometryMeshType: "TorusKnot" | "FiberSplines" | "BlockchainMatrix" | "BiotechDNA" | "LiquidMetalWaves" | "CyberHologram";
}

export interface Agent3MaterialLighting {
  cinematicLighting: {
    ambientHex: string;
    ambientIntensity: number;
    keyLightHex: string;
    keyLightIntensity: number;
    keyLightPosition: [number, number, number];
    fillLightHex: string;
    fillLightIntensity: number;
    rimLightHex: string;
    rimLightIntensity: number;
  };
  pbrMaterial: {
    baseColor: string;
    metalness: number;
    roughness: number;
    transmission: number;
    ior: number;
    clearcoat: number;
    emissiveHex: string;
    emissiveIntensity: number;
  };
}

export interface Agent4Cinematography {
  cameraDP: {
    lensFOV: number;
    motionStyle: string;
    focusDistance: number;
    depthOfFieldBokeh: boolean;
    splinePoints: Array<[number, number, number]>;
  };
}

export interface Master3DPayload {
  seoPackage: {
    title: string;
    description: string;
    seoTags: string[];
  };
  concept: Agent1Concept;
  mathTD: Agent2MathTD;
  materialLighting: Agent3MaterialLighting;
  cinematography: Agent4Cinematography;
  cinematicVFX: {
    bloomIntensity: number;
    chromaticAberrationOffset: number;
    noiseOpacity: number;
    vignette: boolean;
  };
  commercialMarketCategory: string;
  engine3D: any;
  colors: string[];
}

export async function run3DAISwarm(topic?: string, jobIdx?: number): Promise<Master3DPayload> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`\n======================================================`);
  console.log(`🚀 INITIATING 4-AGENT 3D AI SWARM FOR JOB ${jobIndex}: "${promptTopic}" (Seed: ${seed})`);
  console.log(`======================================================`);

  const fallbackPalette = getDynamicPalette(promptTopic, seed);

  // ----------------------------------------------------
  // AGENT 1: The Concept Architect
  // ----------------------------------------------------
  console.log(`🧠 [Agent 1/4 - The Concept Architect] Ideating high-end cinematic stock concept...`);
  let concept: Agent1Concept;
  try {
    const rawA1 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 1 (The Concept Architect) of an elite 3D VFX Swarm for Adobe Stock. Ideate a commercially lucrative, cinematic procedural visual concept. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Topic: "${promptTopic}". Random Seed: "${seed}". Output STRICT JSON: {"conceptTitle": string, "visualMetaphor": string, "artisticDirection": string, "commercialNiche": string}`
        }
      ]
    });
    concept = sanitizeAndParseJson(rawA1);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 1] Using robust procedural concept:`, err.message);
    concept = {
      conceptTitle: `Cinematic 4K VFX: ${promptTopic}`,
      visualMetaphor: `Quantum energy flow and structured procedural geometry reflecting ${promptTopic}`,
      artisticDirection: "High-end commercial stock footage with hyper-realistic PBR materials and deep volumetric lighting",
      commercialNiche: "Technology & Scientific Motion Graphics"
    };
  }

  // ----------------------------------------------------
  // AGENT 2: The Particle & Math TD
  // ----------------------------------------------------
  console.log(`📐 [Agent 2/4 - The Particle & Math TD] Calculating physics, geometry and instanced velocities...`);
  let mathTD: Agent2MathTD;
  try {
    const rawA2 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 2 (The Particle & Math TD). You take a concept and define rigorous 3D procedural mathematics. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Concept: "${concept.conceptTitle}". Metaphor: "${concept.visualMetaphor}".
Generate physics math. Output STRICT JSON:
{
  "particleMath": {
    "instancedCount": 180,
    "spreadRadius": 12,
    "noiseScale": 0.45,
    "velocityVector": [0.2, 0.5, 0.1],
    "rotationalFrequency": 0.15,
    "dispersionFormula": "sin(t*0.8) * cos(i*0.3)"
  },
  "geometryMeshType": "TorusKnot" | "FiberSplines" | "BlockchainMatrix" | "BiotechDNA" | "LiquidMetalWaves" | "CyberHologram"
}`
        }
      ]
    });
    mathTD = sanitizeAndParseJson(rawA2);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 2] Using procedural math fallback:`, err.message);
    const geoms: Agent2MathTD["geometryMeshType"][] = ["FiberSplines", "LiquidMetalWaves", "BlockchainMatrix", "BiotechDNA", "CyberHologram", "TorusKnot"];
    mathTD = {
      particleMath: {
        instancedCount: 180,
        spreadRadius: 12,
        noiseScale: 0.45,
        velocityVector: [0.2, 0.5, 0.1],
        rotationalFrequency: 0.15,
        dispersionFormula: "sin(t*0.8) * cos(i*0.3)"
      },
      geometryMeshType: geoms[Math.abs(jobIndex) % geoms.length]
    };
  }

  // ----------------------------------------------------
  // AGENT 3: The Lighting & Material Scientist
  // ----------------------------------------------------
  console.log(`💡 [Agent 3/4 - The Lighting & Material Scientist] Formulating 3-point PBR illumination & transmission...`);
  let materialLighting: Agent3MaterialLighting;
  try {
    const rawA3 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 3 (The Lighting & Material Scientist). Formulate PBR materials and 3-point cinematic lighting. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Concept: "${concept.conceptTitle}". Geometry: "${mathTD.geometryMeshType}".
Generate lighting & materials. Output STRICT JSON:
{
  "cinematicLighting": {
    "ambientHex": "${fallbackPalette[0]}",
    "ambientIntensity": 1.2,
    "keyLightHex": "#ffffff",
    "keyLightIntensity": 2.8,
    "keyLightPosition": [10, 15, 8],
    "fillLightHex": "${fallbackPalette[1]}",
    "fillLightIntensity": 4.2,
    "rimLightHex": "${fallbackPalette[2]}",
    "rimLightIntensity": 3.8
  },
  "pbrMaterial": {
    "baseColor": "${fallbackPalette[0]}",
    "metalness": 0.95,
    "roughness": 0.08,
    "transmission": 0.0,
    "ior": 1.5,
    "clearcoat": 1.0,
    "emissiveHex": "${fallbackPalette[1]}",
    "emissiveIntensity": 1.8
  }
}`
        }
      ]
    });
    materialLighting = sanitizeAndParseJson(rawA3);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 3] Using procedural lighting fallback:`, err.message);
    materialLighting = {
      cinematicLighting: {
        ambientHex: fallbackPalette[0],
        ambientIntensity: 1.2,
        keyLightHex: "#ffffff",
        keyLightIntensity: 2.8,
        keyLightPosition: [10, 15, 8],
        fillLightHex: fallbackPalette[1],
        fillLightIntensity: 4.2,
        rimLightHex: fallbackPalette[2],
        rimLightIntensity: 3.8
      },
      pbrMaterial: {
        baseColor: fallbackPalette[0],
        metalness: 0.95,
        roughness: 0.08,
        transmission: 0.0,
        ior: 1.5,
        clearcoat: 1.0,
        emissiveHex: fallbackPalette[1],
        emissiveIntensity: 1.8
      }
    };
  }

  // ----------------------------------------------------
  // AGENT 4: The Cinematographer
  // ----------------------------------------------------
  console.log(`🎥 [Agent 4/4 - The Cinematographer] Plotting continuous Catmull-Rom/Bezier camera trajectory...`);
  let cinematography: Agent4Cinematography;
  try {
    const rawA4 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 4 (The Cinematographer). Construct a continuous, cinematic camera motion trajectory with DOF focus. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Concept: "${concept.conceptTitle}". Geometry: "${mathTD.geometryMeshType}".
Generate camera parameters. Output STRICT JSON:
{
  "cameraDP": {
    "lensFOV": 32,
    "motionStyle": "ultra_slow_continuous",
    "focusDistance": 0,
    "depthOfFieldBokeh": true,
    "splinePoints": [
      [0, 5, 34],
      [1.5, 3.5, 26],
      [-1.0, 2.0, 19],
      [0.5, 1.0, 14],
      [0, 0.5, 11]
    ]
  }
}`
        }
      ]
    });
    cinematography = sanitizeAndParseJson(rawA4);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 4] Using procedural camera fallback:`, err.message);
    cinematography = {
      cameraDP: {
        lensFOV: 32,
        motionStyle: "ultra_slow_continuous",
        focusDistance: 0,
        depthOfFieldBokeh: true,
        splinePoints: [
          [0, 5, 34],
          [1.5, 3.5, 26],
          [-1.0, 2.0, 19],
          [0.5, 1.0, 14],
          [0, 0.5, 11]
        ]
      }
    };
  }

  // Combine into Master 3D Payload
  const master3DPayload: Master3DPayload = {
    seoPackage: {
      title: `4K Stock Video: ${promptTopic} | Cinematic 3D VFX`,
      description: `${concept.visualMetaphor}. Tailored for high-end commercial video editors with cinematic PBR rendering.`,
      seoTags: ["3d", "procedural", "4k", "stock video", "vfx", "multi-agent swarm", "pbr", promptTopic.toLowerCase()]
    },
    concept,
    mathTD,
    materialLighting,
    cinematography,
    cinematicVFX: {
      bloomIntensity: 2.5,
      chromaticAberrationOffset: 0.005,
      noiseOpacity: 0.035,
      vignette: true
    },
    commercialMarketCategory: mathTD.geometryMeshType === "FiberSplines" ? "fiber_optic_data_flow" :
                              mathTD.geometryMeshType === "BlockchainMatrix" ? "crypto_blockchain_nodes" :
                              mathTD.geometryMeshType === "BiotechDNA" ? "biotech_microscopic" :
                              mathTD.geometryMeshType === "LiquidMetalWaves" ? "abstract_clean_waves" :
                              mathTD.geometryMeshType === "CyberHologram" ? "cyberpunk_hacker_hud" : "abstract_clean_waves",
    engine3D: {
      solidGeometry: mathTD.geometryMeshType,
      layoutMath: "swarm_instanced_physics",
      colors: [materialLighting.pbrMaterial?.baseColor || fallbackPalette[0], materialLighting.pbrMaterial?.emissiveHex || fallbackPalette[1], fallbackPalette[2]],
      cameraSpeed: 1.0,
      bloomIntensity: 2.5,
      complexity: 1.2
    },
    colors: [materialLighting.pbrMaterial?.baseColor || fallbackPalette[0], materialLighting.pbrMaterial?.emissiveHex || fallbackPalette[1], fallbackPalette[2]]
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/master_3d_payload.json`, JSON.stringify(master3DPayload, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(master3DPayload, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(master3DPayload, null, 2));

  console.log(`✅ [3D SWARM COMPLETE] Synthesized Master 3D Payload (Mesh: ${mathTD.geometryMeshType}, FOV: ${cinematography.cameraDP?.lensFOV})`);
  return master3DPayload;
}

if (require.main === module) {
  run3DAISwarm();
}
