import fs from 'fs';

async function generate() {
  console.log("🧠 🚨 INITIATING ADVANCED VFX DIRECTOR AI 🚨 🧠");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const apiKey = process.env.GROQ_API_KEY || "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"; 

  const payload = {
    model: "llama-3.1-70b-versatile",
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
    response_format: { type: "json_object" }
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
      throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('data/sceneData.json', jsonContent);
    console.log("✅ ADVANCED VFX JSON generated successfully!");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();