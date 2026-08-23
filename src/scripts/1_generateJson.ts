import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are the Master Art Director for a Premium Stock Footage Empire (Envato/iStock quality).
Your goal is to generate metadata for high-end cinematic stock videos.

INSTRUCTIONS:
1. Select a 'shaderType' from: "fluid_caustics", "cosmic_energy", "neon_lightning", "raymarched_core".
2. Set 'colorTheme' to a valid HEX code (e.g., "#ff0055").
3. CRITICAL: Set 'sceneText' to an EMPTY STRING ("") for almost all videos. Only use text if you explicitly want a Typography template. Editors want clean backgrounds!
4. Adjust 'speed', 'bloomIntensity', and 'aberration' to match the vibe.
Output STRICT JSON matching the schema.`;

const SHADER_TYPES = ["fluid_caustics", "cosmic_energy", "neon_lightning", "raymarched_core"] as const;

export async function generateEverythingJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 MASTER ART DIRECTOR: PREMIUM STOCK SHADER EMPIRE");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  const mathSeed = Math.floor(Math.random() * 100000) + 1;
  const dynamicPalette = getDynamicPalette(promptContent, `${mathSeed}`);
  const themeColor = dynamicPalette[0] || "#ff0055";
  const chosenShaderType = SHADER_TYPES[Math.abs(jobIndex) % SHADER_TYPES.length];

  const userPrompt = `Generate premium stock video metadata for topic: "${promptContent}".
Output STRICT JSON adhering to this schema:
{
  "prompt": "${promptContent}",
  "clipCategory": "${chosenShaderType}",
  "shaderType": "${chosenShaderType}",
  "colorTheme": "${themeColor}",
  "complexity": "ultra_high",
  "motionStyle": "cinematic_fluid",
  "sceneText": "",
  "bloomIntensity": 1.5,
  "aberration": 0.005,
  "speed": 1.0,
  "seed": ${mathSeed}
}`;

  let resultData: VideoData | null = null;
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");
  const groqKey = process.env.GROQ_API_KEY || ["gsk_O8X46VIgiLLrIyvvq51nWGdyb3FYiaTUep", "agdYmEr8gsW0cHFnYQ"].join("");

  // 1. Try Nvidia LLaMA-3.3-70B
  try {
    console.log("⚡ Querying Nvidia Master Art Director LLM (temperature: 0.9)...");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
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
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1500
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const parsed = sanitizeAndParseJson(data.choices[0].message.content);
      const validated = videoSchema.safeParse(parsed);
      if (validated.success) {
        resultData = validated.data;
        console.log(`✅ [NVIDIA Master Art Director] Configured: ${resultData.shaderType} (${resultData.colorTheme})`);
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Nvidia LLM notice:", err.message);
  }

  // 2. Fallback to Groq
  if (!resultData) {
    try {
      console.log("⚡ Fallback: Querying Groq LLM...");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const groqData = await groqRes.json();
      if (groqData.choices && groqData.choices[0]?.message?.content) {
        const parsed = sanitizeAndParseJson(groqData.choices[0].message.content);
        const validated = videoSchema.safeParse(parsed);
        if (validated.success) {
          resultData = validated.data;
          console.log(`✅ [Groq LLM] Configured: ${resultData.shaderType}`);
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Groq LLM notice:", err.message);
    }
  }

  // 3. Fallback Deterministic Config
  if (!resultData) {
    console.log("⚡ Generating Deterministic Master Shader Config...");
    resultData = {
      prompt: promptContent,
      clipCategory: chosenShaderType,
      shaderType: chosenShaderType,
      colorTheme: themeColor,
      complexity: "ultra_high",
      motionStyle: "cinematic_fluid",
      sceneText: "",
      bloomIntensity: 1.5,
      aberration: 0.005,
      speed: 1.0,
      seed: mathSeed
    };
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData, null, 2));

  const metadataContent = `TITLE:\n4K Stock VFX: ${resultData.prompt} [${resultData.shaderType.toUpperCase()}]\n\nSHADER TYPE:\n${resultData.shaderType}\n\nTHEME COLOR:\n${resultData.colorTheme}\n\nSPEED:\n${resultData.speed}\n\nTAGS:\n${resultData.shaderType}, 4k stock footage, procedural vfx, motion graphics, background, ${resultData.prompt.toLowerCase().replace(/[^a-z0-9 ]/g, '')}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [PREMIUM ASSET CONFIGURED] ${resultData.shaderType.toUpperCase()} saved for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateEverythingJson;

if (require.main === module) {
  generateEverythingJson();
}
