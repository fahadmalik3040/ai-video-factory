import googleTrends from 'google-trends-api';
import fs from 'fs';

async function catchTopDemand() {
  console.log("🌍 INITIATING GLOBAL GOOGLE TRENDS ALGORITHM...");
  
  try {
    // 1. Fetch Real-Time Live Trends (100% Free, Top Demand)
    const trendData = await googleTrends.realTimeTrends({ geo: 'US', category: 't' }); // 't' = Sci/Tech
    const parsedTrends = JSON.parse(trendData);
    const topTrendingStories = parsedTrends.storySummaries?.slice(0, 3).map((s: any) => s.title).join(" | ") || "AI Quantum Computing | Space Exploration | Neural Networks";
    
    console.log(`🔥 TOP DEMANDING TOPICS: ${topTrendingStories}`);

    // 2. VIP GPT-4o Proxy Engine (No Groq)
    const url = "https://api.hcnsec.cn/v1/chat/completions";
    const apiKey = "sk-rpjOxQpHp56nZiLqDysASSz2CQaTM3EcFlzXqW23OefAue53"; 

    const payload = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an elite stock footage prompt engineer. Output strictly a single CSV line: prompt,category,colorTheme,complexity,motionStyle" },
        { role: "user", content: `LIVE HIGH-DEMAND TRENDS: ${topTrendingStories}. Create 1 ultra-premium, cinematic 3D procedural WebGL video prompt targeting these exact trends. Format strictly as CSV. No markdown, no headers.` }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Proxy Error: ${response.status} - ${await response.text()}`);
    
    const data = await response.json();
    const csvLine = data.choices[0].message.content.trim().replace(/`/g, '');
    
    if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync('data/prompts.csv', `prompt,category,colorTheme,complexity,motionStyle\n${csvLine}`);
    console.log("✅ PREMIUM TREND INJECTED INTO FACTORY!");

  } catch (error) {
    console.error("❌ Research Engine Failed:", error);
    process.exit(1);
  }
}

catchTopDemand();
