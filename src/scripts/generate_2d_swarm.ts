import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export async function run2DAISwarm(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🎨 [2D Pro-Overlay Director] Selecting Editor Overlay for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  const overlays = ["Glitch_Overlay", "Light_Leak", "Cyberpunk_HUD"] as const;
  const chosenOverlay = overlays[Math.abs(jobIndex) % overlays.length];

  let result2D: any = null;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Suggested Overlay: "${chosenOverlay}".

You are an Elite 2D Motion Graphics & VFX Director for Premiere Pro, After Effects, and CapCut template designers. Select the best Editor-Ready Pro-Overlay ("Glitch_Overlay" | "Light_Leak" | "Cyberpunk_HUD") and dial its parameters.

Output STRICT JSON:
{
  "seoPackage": {
    "title": "4K Motion Overlay: ${promptTopic} - ${chosenOverlay.replace(/_/g, ' ')}",
    "description": "High-utility professional video editor overlay for ${promptTopic} with ${chosenOverlay.replace(/_/g, ' ')}.",
    "seoTags": ["2d overlay", "vfx overlay", "premiere pro", "light leak", "glitch", "hud", "${chosenOverlay.toLowerCase()}", "${promptTopic.toLowerCase()}"]
  },
  "engine2D": {
    "activeOverlay": "Glitch_Overlay" | "Light_Leak" | "Cyberpunk_HUD",
    "blendMode": "screen",
    "intensity": 0.85,
    "colors": ["${dynamicPalette[0]}", "${dynamicPalette[1]}"]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are an Elite 2D VFX Overlay Director. Select editor-ready overlays. Output STRICT JSON only."
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.engine2D?.activeOverlay) {
      result2D = parsed;
      console.log(`✅ [2D Director] Selected Pro-Overlay: ${parsed.engine2D.activeOverlay}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [2D Director] Falling back to procedural overlay config:`, err.message);
  }

  if (!result2D) {
    result2D = {
      seoPackage: {
        title: `4K Motion Overlay: ${promptTopic} - ${chosenOverlay.replace(/_/g, ' ')}`,
        description: `High-utility professional video editor overlay for ${promptTopic} with ${chosenOverlay.replace(/_/g, ' ')}.`,
        seoTags: ["2d overlay", "vfx overlay", "premiere pro", "light leak", "glitch", "hud", chosenOverlay.toLowerCase(), promptTopic.toLowerCase()]
      },
      engine2D: {
        activeOverlay: chosenOverlay,
        blendMode: "screen",
        intensity: 0.85,
        colors: [dynamicPalette[0], dynamicPalette[1]]
      }
    };
  }

  result2D.colors = result2D.engine2D.colors;
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(result2D, null, 2));
  fs.writeFileSync(`data/metadata_2d.json`, JSON.stringify(result2D, null, 2));
  fs.writeFileSync(`data/master_2d_payload.json`, JSON.stringify(result2D, null, 2));

  return result2D;
}

if (require.main === module) {
  run2DAISwarm();
}
