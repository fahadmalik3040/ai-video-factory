import Parser from 'rss-parser';
import fs from 'fs';

async function catchTrends() {
  console.log("📡 FETCHING LIVE MARKET TRENDS...");
  const parser = new Parser();
  
  try {
    // Fetch top tech news (100% free, no API key)
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    const headlines = feed.items.slice(0, 5).map(item => item.title).join(" | ");
    console.log("📰 Top Headlines: ", headlines);

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = "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"; 

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an elite stock footage director. Output strictly a single CSV line. No markdown, no headers, no explanations." },
        { role: "user", content: `Read these current headlines: ${headlines}. Create 1 highly cinematic, abstract 3D procedural video prompt that advertisers will need tomorrow to cover these trends. Format strictly as: prompt,category,colorTheme,complexity,motionStyle (e.g., "Glowing quantum chips pulsing","technology","#ff00ff","high","cinematic_orbit"). Do NOT output the header row.` }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const csvLine = data.choices[0].message.content.trim().replace(/`/g, '');
    
    const csvContent = `prompt,category,colorTheme,complexity,motionStyle\n${csvLine}`;
    fs.writeFileSync('data/prompts.csv', csvContent);
    console.log("✅ TREND INJECTED INTO CSV:\n", csvContent);

  } catch (error) {
    console.error("❌ Trend Catching failed:", error);
    process.exit(1);
  }
}

catchTrends();
