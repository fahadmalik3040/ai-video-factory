import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING APINEX MULTI-MODEL BEAST ENGINE...");
  const url = "https://api.apinex.bond/v1/chat/completions";
  const apiKey = "sk-apxab7f2fa3d6a2e78dbfa536ae126b9644f532a24f8c86e89"; 
  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Cybernetic AI";

  // Top fast models on Apinex as fallback if Luna times out
  const models = ["free/gpt-5.6-luna", "gemini/3.8-flash", "deepseek/v4-pro"];
  let success = false;

  for (const model of models) {
    console.log(`\n🔌 Trying model: [${model}]...`);
    try {
      const payload = {
        model: model,
        messages: [
          { role: "system", content: "You are an autonomous JSON script generator. Output STRICT JSON only." },
          { role: "user", content: `Based on this CSV: ${promptContent}\nGenerate a WebGL video script. Schema: { title: string, theme: "science"|"cyber"|"finance"|"technology", durationInFrames: number (900 to 1500), fps: 30, camera: { type: string, speed: number, distance: number, fov: number }, lighting: { keyIntensity: number, fillIntensity: number, rimIntensity: number, colorTheme: string }, particles: { count: number, speed: number, color: string, shape: string }, seoTags: string[] } (exactly 50 tags).` }
        ],
        response_format: { type: "json_object" }
      };

      // 90s Abort Controller to catch timeouts before Cloudflare throws 524
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); 

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const parsedData = JSON.parse(data.choices[0].message.content);
      
      if (!fs.existsSync('data')) fs.mkdirSync('data');
      if (!fs.existsSync('out')) fs.mkdirSync('out');
      
      fs.writeFileSync('data/sceneData.json', JSON.stringify(parsedData, null, 2));
      console.log(`✅ SUCCESS with ${model}! JSON READY!`);
      success = true;
      break; 
    } catch (error: any) {
      console.error(`⚠️ Model ${model} failed (${error.message}). Rotating to next...`);
    }
  }

  if (!success) {
    console.error("❌ ALL models timed out or failed.");
    process.exit(1);
  }
}

generate();