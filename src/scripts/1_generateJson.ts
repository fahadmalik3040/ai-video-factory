import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.resolve('src/data/history.json');

function getHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch (e) { return []; }
  }
  return [];
}

function saveHistory(history: string[]) {
  if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function getLiveTrendingTopics() {
  try {
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    const titles = [];
    const regex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) { titles.push(match[1]); }
    return titles.slice(0, 10);
  } catch (err) {
    return ["Artificial Intelligence", "Space Exploration", "Quantum Computing", "Deep Ocean", "Nanotechnology"];
  }
}

async function generate() {
  const history = getHistory();
  const topTrends = await getLiveTrendingTopics();
  
  // Pick 2 completely different trends
  const trend2D = topTrends[0] || "Cyberpunk Aesthetics";
  const trend3D = topTrends[1] || "Organic Geometry";

  console.log(`🧠 INITIATING DUAL SUB-NICHE ENGINES...`);
  console.log(`🔥 2D Target Trend: ${trend2D}`);
  console.log(`🔥 3D Target Trend: ${trend3D}`);

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
          content: "You are a strict JSON machine. Output exactly ONE JSON object containing two keys: 'config2D' and 'config3D'. Each config MUST have: targetTopic (string), title (string), theme (string), colorTheme (hex string starting with #), seoTags (array of 50 strings), seed (number). DO NOT use dark or black colors for colorTheme." 
        },
        { 
          role: "user", 
          content: `
          ALREADY USED TOPICS: ${JSON.stringify(history)}
          
          TASK 1 (config2D): Deep-drill into "${trend2D}". If used, go to a micro-niche. Create a vibrant 2D stock video config.
          TASK 2 (config3D): Deep-drill into "${trend3D}". If used, go to a totally different micro-niche. Create a cinematic 3D stock video config.
          
          Ensure colorTheme is BRIGHT and VIBRANT (never black or dark gray) to prevent black screens. 
          Output STRICT JSON ONLY.`
        }
      ],
      temperature: 0.9,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    let jsonContent = (completion.choices[0].message.content || "{}").replace(/```json/gi, '').replace(/```/g, '').trim();
    const configData = JSON.parse(jsonContent);

    // Provide bright fallbacks just in case
    const c2D = configData.config2D || {};
    const c3D = configData.config3D || {};

    const final2D = {
      title: c2D.title || `Abstract 2D ${trend2D} 4K`,
      theme: c2D.targetTopic || c2D.theme || trend2D,
      colorTheme: c2D.colorTheme || `#ff00cc`,
      seoTags: c2D.seoTags || ["abstract", "2d", "loop"],
      seed: c2D.seed || parseFloat((Math.random() * 10000).toFixed(2))
    };

    const final3D = {
      title: c3D.title || `Cinematic 3D ${trend3D} 4K`,
      theme: c3D.targetTopic || c3D.theme || trend3D,
      colorTheme: c3D.colorTheme || `#00ffcc`,
      seoTags: c3D.seoTags || ["abstract", "3d", "render"],
      seed: c3D.seed || parseFloat((Math.random() * 10000).toFixed(2))
    };

    history.push(final2D.theme, final3D.theme);
    saveHistory(history);

    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/config2D.json', JSON.stringify(final2D, null, 2));
    fs.writeFileSync('src/data/config3D.json', JSON.stringify(final3D, null, 2));
    
    console.log(`✅ Success! config2D.json and config3D.json saved with completely independent topics.`);
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();