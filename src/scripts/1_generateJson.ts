import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING VIP GROQ ENGINE (Bypassing Proxies)...");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  // Hardcoded key to guarantee GitHub Actions doesn't use stale environment secrets
  const apiKey = "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"; 

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are an autonomous JSON script generator. Output STRICT JSON only." },
      { role: "user", content: "Generate a 3-scene video script about AI. Provide output strictly matching this JSON schema: { title: string, scenes: [{ sceneNumber: number, visualPrompt: string, audioScript: string }] }" }
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
      throw new Error(`GROQ API Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    fs.writeFileSync('data/sceneData.json', jsonContent);
    console.log("✅ JSON generated successfully via Groq!");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();
