import OpenAI from 'openai';
import fs from 'fs';

async function generate() {
  console.log("🧠 CONNECTING VIA OFFICIAL OPENAI SDK (STRICT JSON FORCED)...");
  
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
          content: "You are a machine that strictly outputs valid JSON. NO conversational text, NO markdown, NO introductions. You must output ONLY a JSON object with exactly these keys: title (string), theme (string), colorTheme (hex string starting with #), seoTags (array of 50 strings)." 
        },
        { 
          role: "user", 
          content: "Generate an ultra-demanding stock video config with 50 comma-separated SEO tags for Adobe Stock." 
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" } // 🔥 FORCES MODEL TO OUTPUT PURE JSON
    });

    let rawContent = completion.choices[0].message.content || "{}";
    let jsonContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Extract JSON block just in case
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }

    // 🔥 SECURITY LAYER: Verify JSON. If it fails, use fallback so render NEVER crashes.
    try {
      JSON.parse(jsonContent);
    } catch (e) {
      console.warn("⚠️ Model generated invalid JSON. Injecting bulletproof fallback config...");
      jsonContent = JSON.stringify({
        title: "Cinematic Procedural Abstract Tech Flow 4K",
        theme: "technology, abstract, data",
        colorTheme: "#00ffcc",
        seoTags: ["abstract", "technology", "data", "flow", "network", "cyber", "digital", "background", "loop", "animation", "3d", "procedural", "generative", "ai", "artificial intelligence", "tech", "science", "future", "futuristic", "cybernetic", "glowing", "neon", "particles", "plexus", "connection", "communication", "internet", "web", "cloud", "server", "matrix", "code", "programming", "software", "hardware", "microchip", "circuit", "board", "electricity", "energy", "power", "pulse", "wave", "line", "dot", "grid", "space", "universe", "cosmos", "galaxy"]
      }, null, 2);
    }

    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    console.log("🎉 Success! STRICT JSON Config saved to src/data/videoConfig.json");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();