import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING VIP GROQ ENGINE FOR JSON & METADATA...");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const apiKey = "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"; 

  const promptContent = fs.readFileSync('data/prompts.csv', 'utf-8');

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are an autonomous JSON script generator. Output STRICT JSON only." },
      { role: "user", content: `Based on this CSV data: ${promptContent}\nGenerate a 3-scene video script. Output strictly matching this JSON schema: { title: string, theme: "science"|"cyber"|"finance"|"technology", durationInFrames: number, fps: number, camera: { type: string, speed: number, distance: number, fov: number }, lighting: { keyIntensity: number, fillIntensity: number, rimIntensity: number, colorTheme: string }, particles: { count: number, speed: number, color: string, shape: string }, seoTags: string[] } (ensure exactly 50 trending stock video tags). CRITICAL: Set durationInFrames strictly between 900 and 1500 (which is 30 to 50 seconds at 30fps). Visual prompts must be heavily focused on abstract 3D geometries, particle systems, and data-flows, not humans or real-world physics. ANY color values (like colorTheme) MUST be strictly valid Hex Codes (e.g., #ff0055). NEVER use text descriptions.` }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    const parsedData = JSON.parse(jsonContent);
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('data/sceneData.json', jsonContent);
    
    // Save SEO Metadata for Shutterstock
    const metadataText = `TITLE:\n${parsedData.title}\n\nTAGS (50):\n${parsedData.seoTags.join(", ")}`;
    fs.writeFileSync('out/metadata.txt', metadataText);
    
    console.log("✅ JSON & SEO METADATA GENERATED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}
generate();
