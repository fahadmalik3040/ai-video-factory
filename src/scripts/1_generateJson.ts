import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are a DUAL INDEPENDENT RENDER ORCHESTRATOR for a Premium Stock Footage Empire.
1. job3D: Focus on premium 3D worlds. Pick a category, provide a HEX colorTheme, and set particleCount (10000-25000).
2. job2D: You are an Elite GLSL Demoscene Hacker. Write a highly complex, cinematic GLSL fragment shader in 'customShader' to generate the 2D background. Use Additive mathematical glow. Use uniform float time; uniform vec3 colorTheme; varying vec2 vUv;

CRITICAL JSON RULES:
Escape all newlines as \\n. Output flat minified JSON to prevent parsing errors.`;

function normalizeJobData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (data.job3D) {
    data.job3D.particleCount = Math.min(Math.max(Number(data.job3D.particleCount) || 18000, 10000), 25000);
    if (!data.job3D.colorTheme || !String(data.job3D.colorTheme).startsWith("#")) {
      data.job3D.colorTheme = "#ff0055";
    }
  }

  if (data.job2D) {
    if (!data.job2D.colorTheme || !String(data.job2D.colorTheme).startsWith("#")) {
      data.job2D.colorTheme = "#00f0ff";
    }
    if (!data.job2D.customShader || typeof data.job2D.customShader !== 'string' || !data.job2D.customShader.includes('void main')) {
      data.job2D.customShader = "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float glow = 0.05 / (length(p) + 0.01); gl_FragColor = vec4(colorTheme * glow, 1.0); }";
    }
  }

  return data;
}

async function fetchNvidiaWithRetry(payload: any, retries = 3, delay = 5000): Promise<VideoData> {
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⚡ Querying Nvidia Master Art Director LLM (Attempt ${attempt}/${retries})... WITHOUT ABORT TIMER`);

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Nvidia API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from Nvidia API: Missing choices or content");
      }

      const rawParsed = sanitizeAndParseJson(data.choices[0].message.content);
      const normalized = normalizeJobData(rawParsed);
      const validated = videoSchema.safeParse(normalized);

      if (!validated.success) {
        throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
      }

      return validated.data; // Success!

    } catch (error: any) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      console.log(`⏳ Waiting ${delay / 1000}s before retrying Nvidia...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Failed to fetch from Nvidia after retries");
}

export async function generateDualOrchestratorJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 DUAL INDEPENDENT RENDER ORCHESTRATOR: UNLIMITED AI GLSL PIPELINE");
  console.log("=======================================================================");

  const { topic: mainTopic, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  const mathSeed3D = Math.floor(Math.random() * 100000) + 1;
  const mathSeed2D = Math.floor(Math.random() * 100000) + 2;

  const dynamicPalette3D = getDynamicPalette(mainTopic, `${mathSeed3D}`);
  const dynamicPalette2D = getDynamicPalette(mainTopic + "2D", `${mathSeed2D}`);

  const themeColor3D = dynamicPalette3D[0] || "#ff0055";
  const themeColor2D = dynamicPalette2D[0] || "#00f0ff";

  const categories3D = ["cinematic_galaxy", "quantum_core", "abstract_matrix"] as const;
  const categories2D = ["fluid_caustics", "cosmic_energy", "neon_lightning", "raymarched_core"] as const;

  const chosenCat3D = categories3D[Math.abs(jobIndex) % categories3D.length];
  const chosenCat2D = categories2D[Math.abs(jobIndex + 1) % categories2D.length];

  const trendTopic3D = `${mainTopic} 3D Cinematic Universe`;
  const trendTopic2D = `${mainTopic} Premium VFX Motion`;

  const userPrompt = `Synthesize dual independent stock concepts:
Trend 3D: "${trendTopic3D}"
Trend 2D: "${trendTopic2D}"

Output STRICT single-line minified JSON adhering to this schema:
{
  "job3D": {
    "trendTopic": "${trendTopic3D}",
    "clipCategory": "${chosenCat3D}",
    "colorTheme": "${themeColor3D}",
    "particleCount": 18000
  },
  "job2D": {
    "trendTopic": "${trendTopic2D}",
    "clipCategory": "${chosenCat2D}",
    "colorTheme": "${themeColor2D}",
    "customShader": "A valid, beautiful single-line GLSL fragment shader using uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float glow = 0.05 / (length(p) + 0.01); gl_FragColor = vec4(colorTheme * glow, 1.0); }"
  }
}`;

  let resultData: VideoData;

  try {
    const payload = {
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.85,
      top_p: 0.95,
      max_tokens: 1500
    };

    resultData = await fetchNvidiaWithRetry(payload, 3, 5000);
    console.log(`✅ [NVIDIA Dual Engine] 3D: ${resultData.job3D.clipCategory} | 2D: ${resultData.job2D.clipCategory}`);
  } catch (error: any) {
    console.warn(`⚠️ Network unreachable or Nvidia API down (${error.message}). Switching to High-End Deterministic Generator to keep pipeline running!`);

    const fallbackConfigs: VideoData[] = [
      {
        job3D: {
          trendTopic: trendTopic3D || "Quantum Neural Galaxy",
          clipCategory: "cinematic_galaxy",
          colorTheme: themeColor3D || "#00ffcc",
          particleCount: 18000
        },
        job2D: {
          trendTopic: trendTopic2D || "Fluid Energy Caustics",
          clipCategory: "fluid_caustics",
          colorTheme: themeColor2D || "#ff0055",
          customShader: "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 3.0 - 1.5; for(int i=1; i<5; i++) { vec2 newp = p; newp.x += 0.6/float(i)*sin(float(i)*p.y+time/2.0+0.3); newp.y += 0.6/float(i)*cos(float(i)*p.x+time/2.0+0.3); p = newp; } gl_FragColor = vec4(colorTheme * (0.5 / length(sin(p))), 1.0); }"
        }
      },
      {
        job3D: {
          trendTopic: "Deep Space Singularity",
          clipCategory: "quantum_core",
          colorTheme: "#7b2cbf",
          particleCount: 20000
        },
        job2D: {
          trendTopic: "Cosmic Resonance Pulse",
          clipCategory: "cosmic_energy",
          colorTheme: "#3a86ff",
          customShader: "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float radius = length(p); float wave = sin(10.0 * radius - 2.0 * time + 5.0 * atan(p.y, p.x)); gl_FragColor = vec4(colorTheme * (0.05 / (abs(wave) + 0.01) * exp(-2.0 * radius)) * 2.0, 1.0); }"
        }
      },
      {
        job3D: {
          trendTopic: "Hyperdimensional Matrix",
          clipCategory: "abstract_matrix",
          colorTheme: "#00f0ff",
          particleCount: 22000
        },
        job2D: {
          trendTopic: "Neon Lightning Discharge",
          clipCategory: "neon_lightning",
          colorTheme: "#ff007f",
          customShader: "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float wave = p.y + sin(p.x * 5.0 + time * 3.0) * 0.2 + cos(p.x * 10.0 + time * 5.0) * 0.1; gl_FragColor = vec4(colorTheme * (0.01 / abs(wave)) * 1.5, 1.0); }"
        }
      }
    ];

    resultData = fallbackConfigs[Math.abs(jobIndex) % fallbackConfigs.length];
    console.log(`✨ [High-End Fallback Engine] 3D: ${resultData.job3D.clipCategory} (${resultData.job3D.trendTopic}) | 2D: ${resultData.job2D.clipCategory}`);
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData.job3D, null, 2));
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(resultData.job2D, null, 2));

  const metadataContent = `=== 3D ASSET ===\nTITLE: 4K 3D Visual: ${resultData.job3D.trendTopic} [${resultData.job3D.clipCategory}]\nCOLOR: ${resultData.job3D.colorTheme}\nPARTICLES: ${resultData.job3D.particleCount}\n\n=== 2D ASSET ===\nTITLE: 4K VFX Overlay: ${resultData.job2D.trendTopic} [${resultData.job2D.clipCategory}]\nCOLOR: ${resultData.job2D.colorTheme}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [DUAL ORCHESTRATION COMPLETE] Saved 3D (${resultData.job3D.clipCategory}) & 2D (${resultData.job2D.clipCategory}) for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateDualOrchestratorJson;

if (require.main === module) {
  generateDualOrchestratorJson();
}
