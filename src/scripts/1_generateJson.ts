import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING NVIDIA GOD-MODE ENGINE (NEMOTRON 550B)...");
  
  const apiKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join(""); 
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const model = "nvidia/nemotron-3-ultra-550b-a55b";

  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Cinematic technology abstract";

  const payload = {
    model: model,
    messages: [
      { role: "system", content: "You are an autonomous video script JSON generator. Output STRICT JSON only. Do not add any conversational text before or after the JSON. Ensure the JSON is completely valid and all brackets are closed." },
      { role: "user", content: `Based on this real-time data: ${promptContent}\n\nGenerate a 3-scene video script. Output strictly matching this JSON schema: { "title": "string", "theme": "science"|"cyber"|"finance"|"technology", "durationInFrames": 300, "fps": 30, "camera": { "type": "string", "speed": 1.5, "distance": 10, "fov": 60 }, "lighting": { "keyIntensity": 2.5, "fillIntensity": 0.5, "rimIntensity": 3.0, "colorTheme": "string" }, "particles": { "count": 15000, "speed": 2, "color": "string", "shape": "string" }, "seoTags": ["array of exactly 50 trending tags"] }` }
    ],
    temperature: 0.2,
    max_tokens: 8192 // FIX: Massively increased to prevent truncation of 50 tags
  };

  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;
  let finalJson = "";

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    console.log(`⏳ Nvidia Generation Attempt ${attempt} of ${MAX_RETRIES}...`);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error(`⚠️ Nvidia API Error on attempt ${attempt}:`, data.error.message || data.error);
        if (attempt === MAX_RETRIES) throw new Error(data.error.message || "API Failed");
        await new Promise(res => setTimeout(res, 2000)); 
        continue;
      }

      if (data.choices && data.choices[0]) {
        let rawText = data.choices[0].message.content;
        
        // FIX: Smart Regex to extract ONLY the JSON block even if the AI adds text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            finalJson = jsonMatch[0];
        } else {
            finalJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        }
        
        // Test parsing before declaring success
        JSON.parse(finalJson);
        success = true;
        console.log("✅ NVIDIA 550B MODEL GENERATED AND VERIFIED EPIC JSON SUCCESSFULLY!");
      }
    } catch (err: any) {
      console.error(`❌ Parse/Network Error on attempt ${attempt}:`, err.message);
      if (attempt === MAX_RETRIES) {
        console.error("🚨 FATAL: All 3 Nvidia attempts failed or returned invalid JSON.");
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  // Parse and save
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  if (!fs.existsSync('out')) fs.mkdirSync('out');
  
  try {
    const parsed = JSON.parse(finalJson);
    fs.writeFileSync('data/sceneData.json', JSON.stringify(parsed, null, 2));
    
    const tags = Array.isArray(parsed.seoTags) ? parsed.seoTags.join(", ") : "3d, abstract, 4k";
    fs.writeFileSync('out/metadata.txt', `TITLE:\n${parsed.title || "Epic Nvidia Render"}\n\nTAGS:\n${tags}`);
    console.log("✅ HIGH-QUALITY METADATA SAVED. PROCEEDING TO MAC WEBGL RENDER!");
  } catch (e) {
    console.error("🚨 FATAL: JSON Save Failed.");
    process.exit(1);
  }
}

generate();
