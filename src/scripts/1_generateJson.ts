import OpenAI from 'openai';
import fs from 'fs';

async function fetchLiveMarketData() {
  try {
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    const titles = [];
    const regex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) { titles.push(match[1]); }
    return titles.slice(0, 10).join(", ");
  } catch (err) {
    return "Cybersecurity, Artificial Intelligence, Climate Change, Quantum Computing, Space Economy";
  }
}

async function generate() {
  console.log("🌍 INITIATING MARKET RESEARCH TEAM...");
  const marketData = await fetchLiveMarketData();
  console.log(`📊 Live Keywords: ${marketData}`);
  console.log("🧠 ANALYZING ADOBE STOCK DEMAND & GENERATING BAWAL CODE...");

  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || "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",
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [
        { 
          role: "system", 
          content: `You are an elite Stock Footage Market Analyst and WebGL VFX Genius. 
          Output STRICTLY VALID JSON. 
          Keys required: 
          1. "demandAnalysis" (string explaining why this topic will sell), 
          2. "title" (commercial title), 
          3. "seoTags" (array of 50 exact buyer tags), 
          4. "reactCode" (A complete, self-contained React component using THREE.js for Remotion).
          RULES FOR reactCode: It MUST be named 'BawalAsset'. It MUST use 'three' (import * as THREE from 'three'). It MUST create a mind-blowing, highly complex procedural animation (e.g., fluid particles, raymarching, neon geometry) inside a canvas. NO TEXT EVER. Only breathtaking visuals.` 
        },
        { 
          role: "user", 
          content: `Live Market Data: [${marketData}]. 
          Step 1: Identify the most profitable, high-demand/low-supply abstract stock footage concept from this data.
          Step 2: Write the exact React + THREE.js code to generate this visual for 4K video. Make the math and lighting ultra-realistic and cinematic. Output pure JSON.` 
        }
      ],
      temperature: 0.9,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    let jsonContent = (completion.choices[0].message.content || "{}").replace(/```json/gi, '').replace(/```/g, '').trim();
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    
    const parsed = JSON.parse(jsonContent);
    console.log(`✅ DEMAND FOUND: ${parsed.title}`);
    console.log(`💡 STRATEGY: ${parsed.demandAnalysis}`);
    console.log(`🚀 Bawal Code Generated & Saved!`);

  } catch (error) {
    console.error("❌ Market Research Failed:", error);
    process.exit(1);
  }
}

generate();