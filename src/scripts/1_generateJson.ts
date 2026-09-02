import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.resolve('src/data/history.json');

// 🧠 HISTORY MANAGER: Reads previously generated topics to prevent ANY duplicates
function getHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveHistory(history: string[]) {
  if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// 🌍 RSS FEED SCRAPER
async function getLiveTrendingTopics() {
  try {
    console.log("🌍 Fetching LIVE Google Trends RSS...");
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    
    const titles = [];
    const regex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      titles.push(match[1]);
    }
    return titles.slice(0, 5); // Top 5 trends
  } catch (err) {
    console.warn("⚠️ RSS fetch failed. Using fallback broad categories.");
    return ["Artificial Intelligence", "Space Exploration", "Quantum Computing", "Deep Ocean", "Nanotechnology"];
  }
}

async function generate() {
  const history = getHistory();
  const topTrends = await getLiveTrendingTopics();
  const shaderSeed = parseFloat((Math.random() * 10000).toFixed(2));
  
  console.log(`📜 Loaded ${history.length} past topics from history.`);
  console.log(`🔥 Current Top Trends: ${topTrends.join(', ')}`);
  console.log(`🧠 INITIATING DEEP SUB-NICHE ENGINE...`);

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
          content: "You are the Ultimate Deep-Drill Sub-Niche Engine. Strictly output ONLY valid JSON. Keys required: targetTopic (string), title (string), theme (string), colorTheme (hex string starting with #), seoTags (array of 50 exact strings), seed (number)." 
        },
        { 
          role: "user", 
          content: `
          LIVE TRENDS: ${JSON.stringify(topTrends)}
          ALREADY USED TOPICS (HISTORY): ${JSON.stringify(history)}
          
          RULES:
          1. Pick the #1 Live Trend.
          2. IF it is in the ALREADY USED TOPICS, you MUST drill down to a specific sub-niche.
          3. IF that sub-niche is also conceptually in the history, drill down to a sub-sub-niche (Micro-Niche).
          4. Keep drilling until you find a 100% unexplored, UNIQUE micro-topic.
          5. Design an ultra-demanding, procedural abstract Adobe Stock video config entirely around this UNIQUE micro-topic.
          6. Your selected unique topic MUST be saved in the key 'targetTopic'.
          7. The 'seed' MUST be exactly: ${shaderSeed}.
          Output STRICT JSON ONLY.`
        }
      ],
      temperature: 0.9,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    let rawContent = completion.choices[0].message.content || "{}";
    let jsonContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }

    const config = JSON.parse(jsonContent);
    const selectedTopic = config.targetTopic || config.theme || "Unknown Topic";

    // Validate and Clean up for frontend
    const finalConfig = {
      title: config.title || `Abstract ${selectedTopic} 4K`,
      theme: selectedTopic,
      colorTheme: config.colorTheme || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      seoTags: Array.isArray(config.seoTags) && config.seoTags.length > 0 ? config.seoTags : ["abstract", "background", "loop", "animation", "procedural"],
      seed: shaderSeed
    };

    // Update History
    history.push(selectedTopic);
    saveHistory(history);

    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', JSON.stringify(finalConfig, null, 2));
    
    console.log(`🎯 SUB-NICHE ENGINE LOCKED ON: "${selectedTopic}"`);
    console.log(`🎉 Success! Video Config saved. Topic added to history.json to prevent future duplicates.`);

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();