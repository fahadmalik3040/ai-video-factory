import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING UNDERGROUND NO-KEY AI (POLLINATIONS)...");
  
  // The backdoor proxy URL - NO API KEY NEEDED
  const url = "https://text.pollinations.ai/";

  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Cinematic technology abstract";

  const systemInstruction = "You are a strict JSON generator. Output ONLY a valid JSON object matching this schema: { title: string, theme: 'science'|'cyber'|'finance'|'technology', durationInFrames: number, fps: number, camera: { type: string, speed: number, distance: number, fov: number }, lighting: { keyIntensity: number, fillIntensity: number, rimIntensity: number, colorTheme: string }, particles: { count: number, speed: number, color: string, shape: string }, seoTags: string[] }. Never add markdown formatting, backticks, or extra text.";

  const payload = {
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: `Generate strictly valid JSON for this prompt: ${promptContent}` }
    ],
    model: "openai", // Routes to top-tier OpenAI models internally
    jsonMode: true
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Pollinations returns raw text directly, not a complex nested JSON response
    const textData = await response.text();
    
    if (!textData || textData.includes("error")) {
        console.error("🚨 PROXY ERROR:", textData);
        process.exit(1);
    }

    // Strip markdown formatting just in case the AI tries to be smart
    const cleanJson = textData.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    // Validate JSON
    const parsedData = JSON.parse(cleanJson);
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('data/sceneData.json', cleanJson);
    
    const safeTitle = parsedData.title || "Cinematic 3D Abstract Animation";
    const safeTags = Array.isArray(parsedData.seoTags) && parsedData.seoTags.length > 0 
      ? parsedData.seoTags 
      : ["cinematic", "abstract", "technology", "3d", "motion graphics", "background", "loop", "data", "scifi", "4k"];
      
    const metadataText = `TITLE:\n${safeTitle}\n\nTAGS:\n${safeTags.join(", ")}`;
    fs.writeFileSync('out/metadata.txt', metadataText);
    
    console.log("✅ HACK SUCCESSFUL! STRICT JSON SAVED WITHOUT ANY API KEY.");
  } catch (err) {
    console.error("❌ Generation failed. Could not parse JSON:", err);
    process.exit(1);
  }
}

generate();
