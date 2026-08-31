import fs from 'fs';
import path from 'path';

async function generate() {
  console.log("🧠 🚨 INITIATING DUAL-ENGINE AI ARCHITECT (2D + 3D) 🚨 🧠");
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    const parsedData = JSON.parse(jsonContent);

    const dataDir = path.resolve('data');
    const outDir = path.resolve('out');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const video2D = parsedData.video2D || parsedData;
    const video3D = parsedData.video3D || parsedData;

    fs.writeFileSync(path.join(dataDir, 'sceneData2D.json'), JSON.stringify(video2D, null, 2));
    fs.writeFileSync(path.join(dataDir, 'sceneData3D.json'), JSON.stringify(video3D, null, 2));

    console.log("✅ DUAL JSON generated successfully!");
    console.log("📁 Saved: data/sceneData2D.json");
    console.log("📁 Saved: data/sceneData3D.json");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();