import fs from 'fs';

async function generate() {
  console.log("🧠 🚨 INITIATING NVIDIA NEMOTRON 550B SUPERCOMPUTER 🚨 🧠");
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = "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"; 

  const payload = {
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [
      { 
        role: "system", 
        content: "You are a master VFX Director and WebGL Architect. Your job is to output STRICT JSON matching the schema. NEVER repeat the same visual combinations. Invent crazy, cinematic, dynamic procedural environments." 
      },
      { 
        role: "user", 
        content: "Generate a highly advanced stock video script for a trending tech/finance topic. Use the JSON schema provided. Pick complex shapes like 'fractal_cloud' or 'data_monolith'. Make the colors contrast beautifully (e.g., neon pink and cyan). Set particleCount between 5000 and 10000 with complex motions like 'vortex' or 'matrix_rain'. Set the camera path to something highly dynamic. DO NOT output basic or boring parameters." 
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
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('data/sceneData.json', jsonContent);
    console.log("✅ ADVANCED VFX JSON generated successfully via Nemotron 550B!");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();