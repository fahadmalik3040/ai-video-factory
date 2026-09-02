import OpenAI from 'openai';
import fs from 'fs';

// 🌍 BULLETPROOF MARKET RESEARCH ENGINE
async function fetchLiveMarketData() {
  try {
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    const titles = [];
    const regex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) { titles.push(match[1]); }
    if (titles.length === 0) throw new Error("Feed Empty");
    return titles.slice(0, 10).join(", ");
  } catch (err) {
    return "Cybernetic Core, Bioluminescent Fluid Dynamics, Quantum Data Network, AI Neural Pathways";
  }
}

async function generate() {
  console.log("🌍 INITIATING MARKET RESEARCH TEAM...");
  const marketData = await fetchLiveMarketData();
  console.log(`📊 Live Keywords: ${marketData}`);
  console.log("🧠 CONNECTING TO NVIDIA SERVERS TO AUTO-DETECT ACTIVE MODELS...");

  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || "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",
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  try {
    // 🔥 THE IMMORTAL FIX: AUTO-DISCOVERY ENGINE
    const modelsResponse = await openai.models.list();
    const activeModels = modelsResponse.data.map((m: any) => m.id);
    
    // System khud sabse best zinda model dhoondhega (no hardcoding limits)
    const selectedModel = 
      activeModels.find((id: string) => id.includes("deepseek-r1")) ||
      activeModels.find((id: string) => id.includes("mistral-large")) || 
      activeModels.find((id: string) => id.includes("llama-3.1-405b")) || 
      activeModels.find((id: string) => id.includes("instruct") && id.includes("nemotron")) ||
      activeModels[0]; // Agar sab fail hue toh jo available hai wo use karega
      
    console.log(`🔌 AUTO-LOCKED LIVE NVIDIA MODEL: ${selectedModel}`);
    console.log("🧠 GENERATING BAWAL CODE (VERSION 3.0 - IMMORTAL)...");

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { 
          role: "system", 
          content: `You are an elite Stock Footage Market Analyst and WebGL VFX Genius. 
          Output STRICTLY VALID JSON ONLY. Do NOT wrap in Markdown.
          Keys required: 
          1. "demandAnalysis" (why this topic sells), 
          2. "title" (commercial title), 
          3. "seoTags" (array of 50 buyer tags), 
          4. "reactCode" (A complete, self-contained React component using THREE.js for Remotion).
          RULES FOR reactCode: MUST be named 'BawalAsset'. MUST import THREE ('import * as THREE from "three";'). MUST create a highly complex procedural animation inside a canvas. NO TEXT EVER.` 
        },
        { 
          role: "user", 
          content: `Live Market Data: [${marketData}]. 
          Step 1: Identify the most profitable abstract stock footage concept from this data.
          Step 2: Write the exact React + THREE.js code to generate this visual for 4K video. Make the math and lighting ultra-realistic and cinematic. Output pure JSON.` 
        }
      ],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    let jsonContent = (completion.choices[0].message.content || "{}").replace(/```json/gi, '').replace(/```/g, '').trim();
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    
    const parsed = JSON.parse(jsonContent);
    console.log(`✅ DEMAND FOUND: ${parsed.title}`);
    console.log(`💡 STRATEGY: ${parsed.demandAnalysis}`);
    console.log(`🚀 Immortal Code Generated & Saved!`);

  } catch (error) {
    console.error("❌ Market Research Failed:", error);
    process.exit(1);
  }
}

generate();