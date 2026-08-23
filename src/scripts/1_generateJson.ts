import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are a DUAL INDEPENDENT RENDER ORCHESTRATOR for a Premium Stock Footage Empire.
Generate TWO independent video concepts.
1. job3D: Focus on premium 3D worlds. Pick a category, provide a HEX colorTheme, and set particleCount.
2. job2D: Focus on premium 2D Post-Production VFX. Pick a 'shaderCategory' from the enum and provide a HEX colorTheme. 

CRITICAL: Output STRICT JSON. Do NOT write any GLSL code.`;

export async function generateDualOrchestratorJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 DUAL INDEPENDENT RENDER ORCHESTRATOR: CATEGORY SELECTION PIPELINE");
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

Output STRICT JSON adhering to this schema:
{
  "job3D": {
    "trendTopic": "${trendTopic3D}",
    "clipCategory": "${chosenCat3D}",
    "colorTheme": "${themeColor3D}",
    "particleCount": 15000
  },
  "job2D": {
    "trendTopic": "${trendTopic2D}",
    "shaderCategory": "${chosenCat2D}",
    "colorTheme": "${themeColor2D}"
  }
}`;

  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");
  let resultData: VideoData;

  console.log("⚡ Querying Nvidia Master Art Director LLM...");
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${nvidiaKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Nvidia API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response format from Nvidia API: Missing choices or content");
    }

    const parsed = sanitizeAndParseJson(data.choices[0].message.content);
    const validated = videoSchema.safeParse(parsed);
    
    if (!validated.success) {
      throw new Error(`Schema validation failed on Nvidia output: ${JSON.stringify(validated.error.format())}`);
    }

    resultData = validated.data;
    console.log(`✅ [NVIDIA Dual Engine] 3D: ${resultData.job3D.clipCategory} | 2D: ${resultData.job2D.shaderCategory}`);
  } catch (error) {
    console.error("❌ FATAL: Nvidia LLM completely failed. No fallbacks allowed. Exiting.", error);
    process.exit(1);
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData.job3D, null, 2));
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(resultData.job2D, null, 2));

  const metadataContent = `=== 3D ASSET ===\nTITLE: 4K 3D Visual: ${resultData.job3D.trendTopic} [${resultData.job3D.clipCategory}]\nCOLOR: ${resultData.job3D.colorTheme}\nPARTICLES: ${resultData.job3D.particleCount}\n\n=== 2D ASSET ===\nTITLE: 4K VFX Overlay: ${resultData.job2D.trendTopic} [${resultData.job2D.shaderCategory}]\nCOLOR: ${resultData.job2D.colorTheme}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [DUAL ORCHESTRATION COMPLETE] Saved 3D (${resultData.job3D.clipCategory}) & 2D (${resultData.job2D.shaderCategory}) for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateDualOrchestratorJson;

if (require.main === module) {
  generateDualOrchestratorJson();
}
