import fs from 'fs';
import path from 'path';

// 🔄 RESILIENT FETCH WITH EXPONENTIAL BACKOFF RETRIES
async function fetchWithRetry(url: string, options: RequestInit, retries = 4, initialDelay = 4000): Promise<Response> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      const errorText = await response.text();
      const isRetryable = response.status === 503 || response.status === 429 || response.status === 502 || response.status === 504;

      if (isRetryable && i < retries - 1) {
        console.warn(`⚠️ NVIDIA API busy (${response.status}). Retrying in ${delay / 1000}s (Attempt ${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff (4s -> 8s -> 16s -> 32s)
        continue;
      }
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    } catch (err: any) {
      if (i < retries - 1) {
        console.warn(`⚠️ Network/API hiccup: ${err.message}. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded for NVIDIA API");
}

async function generate() {
  console.log("🧠 🚨 INITIATING DUAL-ENGINE AI ARCHITECT WITH RETRY LOGIC 🚨 🧠");
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY || "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";

  const payload = {
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [
      { 
        role: "system", 
        content: `You are an autonomous Dual-Engine Video Architect. You MUST output STRICT JSON matching this exact structure:
{
  "video2D": {
    "engine": "2D",
    "title": string,
    "theme": string,
    "durationInFrames": number (between 900 and 1500),
    "fps": 30,
    "layout": { "bgColor": string, "textColor": string, "accentColor": string },
    "shapes": { "type": "circles" | "waves" | "grids", "count": number (between 5 and 20) },
    "seoTags": string[]
  },
  "video3D": {
    "engine": "3D",
    "title": string,
    "theme": string,
    "durationInFrames": number (between 900 and 1500),
    "fps": 30,
    "environment": { "primaryColor": string, "secondaryColor": string },
    "mainGeometry": { "shape": "quantum_rings" | "data_monolith" | "fractal_cloud", "wireframe": boolean, "rotationSpeed": number },
    "vfx": { "particleCount": number (between 3000 and 8000) },
    "seoTags": string[]
  }
}
Do NOT output markdown or explanations. Output pure JSON only.` 
      },
      { 
        role: "user", 
        content: "Generate TWO distinct, high-concept stock footage concepts for a trending AI/Finance tech topic: one optimized for 2D Motion Graphics and one for pure 3D WebGL VFX." 
      }
    ],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    response_format: { type: "json_object" },
    chat_template_kwargs: { enable_thinking: true }
  };

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    const parsedData = JSON.parse(jsonContent);

    const dataDir = path.resolve('data');
    const outDir = path.resolve('out');
    const srcDataDir = path.resolve('src/data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

    const video2D = parsedData.video2D || parsedData;
    const video3D = parsedData.video3D || parsedData;

    fs.writeFileSync(path.join(dataDir, 'sceneData2D.json'), JSON.stringify(video2D, null, 2));
    fs.writeFileSync(path.join(dataDir, 'sceneData3D.json'), JSON.stringify(video3D, null, 2));
    fs.writeFileSync(path.join(srcDataDir, 'videoConfig.json'), JSON.stringify(parsedData, null, 2));

    console.log("✅ DUAL JSON generated successfully via Resilient NVIDIA Engine!");
    console.log("📁 Saved: data/sceneData2D.json");
    console.log("📁 Saved: data/sceneData3D.json");
    console.log("📁 Saved: src/data/videoConfig.json");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();