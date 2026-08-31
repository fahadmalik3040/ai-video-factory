import OpenAI from 'openai';
import fs from 'fs';

async function generate() {
  console.log("🧠 CONNECTING VIA OFFICIAL OPENAI SDK (CLEAN REQUEST)...");
  
  const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [
        { 
          role: "system", 
          content: "You are an elite stock footage metadata and 3D visual director. Output STRICT JSON only with keys: title (string), theme (string), colorTheme (hex string), seoTags (array of exactly 50 high-demand stock video tags)." 
        },
        { 
          role: "user", 
          content: "Generate an ultra-demanding stock video config with 50 comma-separated SEO tags for Adobe Stock and Shutterstock in strict JSON format." 
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });

    let jsonContent = completion.choices[0].message.content || "";
    jsonContent = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }

    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    console.log("🎉 Success! Config generated via official SDK and saved to src/data/videoConfig.json");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();