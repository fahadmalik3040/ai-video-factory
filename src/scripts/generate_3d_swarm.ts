import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function run3DAISwarm(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎥 [3D Pro-VFX Director] Selecting High-End VFX Module for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  const modules = ["Data_Tunnel", "Cinematic_Dust", "Glass_Abstract"] as const;
  const chosenModule = modules[Math.abs(jobIndex) % modules.length];

  let result3D: any = null;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Suggested Module: "${chosenModule}".

You are an Elite 3D VFX Director for high-budget commercial stock footage (Adobe Stock / Shutterstock). Select the best Pro-VFX module ("Data_Tunnel" | "Cinematic_Dust" | "Glass_Abstract") and dial its parameters.

Output STRICT JSON:
{
  "seoPackage": {
    "title": "4K Stock VFX: ${promptTopic} - ${chosenModule.replace(/_/g, ' ')}",
    "description": "High-end commercial stock VFX overlay of ${promptTopic} featuring ${chosenModule.replace(/_/g, ' ')}.",
    "seoTags": ["3d vfx", "4k stock", "pro vfx", "b-roll", "drei", "apple commercial", "${chosenModule.toLowerCase()}", "${promptTopic.toLowerCase()}"]
  },
  "engine3D": {
    "activeModule": "Data_Tunnel" | "Cinematic_Dust" | "Glass_Abstract",
    "themeColors": ["${dynamicPalette[0]}", "${dynamicPalette[1]}"],
    "speedMultiplier": 0.8,
    "cameraMotion": "slow_pan" | "orbit"
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are an Elite 3D VFX Director. Select Pro-VFX modules for commercial video editors. Output STRICT JSON only."
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.engine3D?.activeModule) {
      result3D = parsed;
      console.log(`✅ [3D Director] Selected Pro-VFX Module: ${parsed.engine3D.activeModule}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [3D Director] Falling back to procedural VFX config:`, err.message);
  }

  if (!result3D) {
    result3D = {
      seoPackage: {
        title: `4K Stock VFX: ${promptTopic} - ${chosenModule.replace(/_/g, ' ')}`,
        description: `High-end commercial stock VFX overlay of ${promptTopic} featuring ${chosenModule.replace(/_/g, ' ')}.`,
        seoTags: ["3d vfx", "4k stock", "pro vfx", "b-roll", "drei", "apple commercial", chosenModule.toLowerCase(), promptTopic.toLowerCase()]
      },
      engine3D: {
        activeModule: chosenModule,
        themeColors: [dynamicPalette[0], dynamicPalette[1]],
        speedMultiplier: 0.8,
        cameraMotion: "slow_pan"
      }
    };
  }

  result3D.colors = result3D.engine3D.themeColors;
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(result3D, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(result3D, null, 2));
  fs.writeFileSync(`data/master_3d_payload.json`, JSON.stringify(result3D, null, 2));

  return result3D;
}

if (require.main === module) {
  run3DAISwarm();
}
