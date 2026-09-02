import OpenAI from 'openai';
import fs from 'fs';

async function generate() {
  console.log("🧠 INITIATING GLSL SHADER ENGINE: Generating 100% Unique Mathematics...");
  
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
          content: "You are an elite GLSL Shader developer for high-end stock footage. Output ONLY valid JSON containing: 'title', 'seoTags' (array of 50), and 'glsl' (a complete WebGL fragment shader string using 'uniform float u_time;' and 'uniform vec2 u_resolution;'). The shader MUST be a breathtaking abstract visual (e.g., raymarching, fluid, neon fractal) without any text." 
        },
        { 
          role: "user", 
          content: "Write a completely unique, highly complex 4K-ready abstract GLSL fragment shader for Adobe Stock. Ensure vibrant colors and smooth looping animation over time. Output strictly JSON." 
        }
      ],
      temperature: 0.9,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    let jsonContent = (completion.choices[0].message.content || "{}").replace(/```json/gi, '').replace(/```/g, '').trim();
    
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    console.log("✅ Success! Raw GLSL Shader generated and saved.");

  } catch (error) {
    console.error("❌ Shader Generation failed:", error);
    process.exit(1);
  }
}

generate();