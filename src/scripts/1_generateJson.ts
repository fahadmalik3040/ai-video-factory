import OpenAI from 'openai';
import fs from 'fs';

async function generate() {
  console.log("🧠 CONNECTING VIA OFFICIAL OPENAI SDK TO BYPASS AXUM HEADER BUG...");
  
  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || "",
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
      max_tokens: 4096,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: true
        }
      }
    } as any);

    let jsonContent = completion.choices[0].message.content || "";
    jsonContent = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Fallback JSON extraction if thinking tags wrap it
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