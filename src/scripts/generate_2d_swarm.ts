import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export interface Agent5MotionDirector {
  visualStructure: {
    archetypeName: "cyber_matrix_telemetry" | "organic_liquid_prism" | "parametric_audio_equalizer" | "kinetic_bauhaus_grid" | "neon_data_vortex" | "holographic_neural_synapse";
    structuralDescription: string;
    energySpeed: number;
    complexity: number;
  };
}

export interface Agent6ColorTheorist {
  colorTheory: {
    primaryTechGlow: string;
    secondaryAccent: string;
    glowHighlight: string;
    backgroundAmbiance: string;
    paletteArray: string[];
  };
}

export interface Agent7Compositor {
  compositingVFX: {
    bloomIntensity: number;
    bloomThreshold: number;
    chromaticAberrationOffset: number;
    filmGrainNoise: number;
    vignetteDarkness: number;
  };
}

export interface Master2DPayload {
  seoPackage: {
    title: string;
    description: string;
    seoTags: string[];
  };
  motionDirector: Agent5MotionDirector;
  colorTheorist: Agent6ColorTheorist;
  compositor: Agent7Compositor;
  commercialMarketCategory: string;
  engine2D: any;
  colors: string[];
}

export async function run2DAISwarm(topic?: string, jobIdx?: number): Promise<Master2DPayload> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`\n======================================================`);
  console.log(`🎨 INITIATING 3-AGENT 2D AI SWARM FOR JOB ${jobIndex}: "${promptTopic}" (Seed: ${seed})`);
  console.log(`======================================================`);

  const fallbackPalette = getDynamicPalette(promptTopic, seed);
  const archetypes: Agent5MotionDirector["visualStructure"]["archetypeName"][] = [
    "cyber_matrix_telemetry",
    "organic_liquid_prism",
    "parametric_audio_equalizer",
    "kinetic_bauhaus_grid",
    "neon_data_vortex",
    "holographic_neural_synapse"
  ];
  const chosenArchetype = archetypes[Math.abs(jobIndex) % archetypes.length];

  // ----------------------------------------------------
  // AGENT 5: The Motion Director
  // ----------------------------------------------------
  console.log(`🎬 [Agent 5/7 - The Motion Director] Designing 2D structural choreography & SVG telemetry...`);
  let motionDirector: Agent5MotionDirector;
  try {
    const rawA5 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 5 (The Motion Director). Design pure visual 2D motion graphics with ZERO text, letters or numbers. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Topic: "${promptTopic}". Random Seed: "${seed}".
Select the best matching archetype from: ["cyber_matrix_telemetry", "organic_liquid_prism", "parametric_audio_equalizer", "kinetic_bauhaus_grid", "neon_data_vortex", "holographic_neural_synapse"].
Output STRICT JSON:
{
  "visualStructure": {
    "archetypeName": "cyber_matrix_telemetry" | "organic_liquid_prism" | "parametric_audio_equalizer" | "kinetic_bauhaus_grid" | "neon_data_vortex" | "holographic_neural_synapse",
    "structuralDescription": string,
    "energySpeed": 1.1,
    "complexity": 1.3
  }
}`
        }
      ]
    });
    motionDirector = sanitizeAndParseJson(rawA5);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 5] Using procedural motion director fallback:`, err.message);
    motionDirector = {
      visualStructure: {
        archetypeName: chosenArchetype,
        structuralDescription: `Dynamic pure visual mathematical choreography of ${chosenArchetype.replace(/_/g, ' ')}`,
        energySpeed: 1.1,
        complexity: 1.3
      }
    };
  }

  // ----------------------------------------------------
  // AGENT 6: The Color Theorist
  // ----------------------------------------------------
  console.log(`🎨 [Agent 6/7 - The Color Theorist] Synthesizing mathematically harmonious color harmonies...`);
  let colorTheorist: Agent6ColorTheorist;
  try {
    const rawA6 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 6 (The Color Theorist). Generate an evocative, high-contrast color palette. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Topic: "${promptTopic}". Archetype: "${motionDirector.visualStructure?.archetypeName}".
Generate color theory payload. Output STRICT JSON:
{
  "colorTheory": {
    "primaryTechGlow": "${fallbackPalette[0]}",
    "secondaryAccent": "${fallbackPalette[1]}",
    "glowHighlight": "${fallbackPalette[2]}",
    "backgroundAmbiance": "#03040a",
    "paletteArray": ["${fallbackPalette[0]}", "${fallbackPalette[1]}", "${fallbackPalette[2]}", "${fallbackPalette[3]}"]
  }
}`
        }
      ]
    });
    colorTheorist = sanitizeAndParseJson(rawA6);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 6] Using procedural color theorist fallback:`, err.message);
    colorTheorist = {
      colorTheory: {
        primaryTechGlow: fallbackPalette[0],
        secondaryAccent: fallbackPalette[1],
        glowHighlight: fallbackPalette[2],
        backgroundAmbiance: "#03040a",
        paletteArray: fallbackPalette
      }
    };
  }

  // ----------------------------------------------------
  // AGENT 7: The Compositor
  // ----------------------------------------------------
  console.log(`✨ [Agent 7/7 - The Compositor] Calibrating bloom thresholds, chromatic aberration & grain...`);
  let compositor: Agent7Compositor;
  try {
    const rawA7 = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are Agent 7 (The Compositor). Output post-processing and optical VFX parameters. Output STRICT JSON."
        },
        {
          role: "user",
          content: `Topic: "${promptTopic}". Archetype: "${motionDirector.visualStructure?.archetypeName}".
Output STRICT JSON:
{
  "compositingVFX": {
    "bloomIntensity": 2.8,
    "bloomThreshold": 0.2,
    "chromaticAberrationOffset": 0.005,
    "filmGrainNoise": 0.035,
    "vignetteDarkness": 1.1
  }
}`
        }
      ]
    });
    compositor = sanitizeAndParseJson(rawA7);
  } catch (err: any) {
    console.warn(`⚠️ [Agent 7] Using procedural compositor fallback:`, err.message);
    compositor = {
      compositingVFX: {
        bloomIntensity: 2.8,
        bloomThreshold: 0.2,
        chromaticAberrationOffset: 0.005,
        filmGrainNoise: 0.035,
        vignetteDarkness: 1.1
      }
    };
  }

  const resolvedPalette = colorTheorist.colorTheory?.paletteArray || fallbackPalette;
  const resolvedArchetype = motionDirector.visualStructure?.archetypeName || chosenArchetype;

  // Combine into Master 2D Payload
  const master2DPayload: Master2DPayload = {
    seoPackage: {
      title: `4K Motion Graphics: ${promptTopic} | Abstract 2D VFX`,
      description: `${motionDirector.visualStructure?.structuralDescription}. 100% pure visual procedural motion graphics.`,
      seoTags: ["2d motion graphics", "abstract", "4k", "hud", "mograph", "vfx overlay", "swarm", promptTopic.toLowerCase()]
    },
    motionDirector,
    colorTheorist,
    compositor,
    commercialMarketCategory: resolvedArchetype === "parametric_audio_equalizer" ? "fiber_optic_data_flow" :
                              resolvedArchetype === "kinetic_bauhaus_grid" ? "crypto_blockchain_nodes" :
                              resolvedArchetype === "holographic_neural_synapse" ? "biotech_microscopic" :
                              resolvedArchetype === "organic_liquid_prism" ? "abstract_clean_waves" :
                              resolvedArchetype === "cyber_matrix_telemetry" ? "cyberpunk_hacker_hud" : "abstract_clean_waves",
    engine2D: {
      layoutStructure: resolvedArchetype,
      colorPalette: resolvedPalette,
      energySpeed: motionDirector.visualStructure?.energySpeed || 1.1,
      complexity: motionDirector.visualStructure?.complexity || 1.2,
      glowIntensity: compositor.compositingVFX?.bloomIntensity || 2.8,
      elements: [
        { type: "data_ring", scale: 1.0, thickness: 3 },
        { type: "glass_blob", size: 400 },
        { type: "hud_grid", rows: 5, cols: 8 },
        { type: "waveform_bars", scale: 1.1 }
      ]
    },
    colors: resolvedPalette
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/master_2d_payload.json`, JSON.stringify(master2DPayload, null, 2));
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(master2DPayload, null, 2));
  fs.writeFileSync(`data/metadata_2d.json`, JSON.stringify(master2DPayload, null, 2));

  console.log(`✅ [2D SWARM COMPLETE] Synthesized Master 2D Payload (Archetype: ${resolvedArchetype})`);
  return master2DPayload;
}

if (require.main === module) {
  run2DAISwarm();
}
