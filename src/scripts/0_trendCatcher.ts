import Parser from 'rss-parser';
import fs from 'fs';

async function catchTrends() {
  console.log("📡 FETCHING LIVE MARKET TRENDS & AUTOCOMPLETE DATA...");
  try {
    const parser = new Parser();
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    const headlines = feed.items.slice(0, 3).map(i => i.title).join(" | ");

    const suggestRes = await fetch('https://duckduckgo.com/ac/?q=cinematic+stock+video+technology');
    const suggestData = await suggestRes.json();
    const hotKeywords = suggestData.map((item: any) => item.phrase).join(", ");

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = "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"; 

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an elite stock footage prompt engineer. You are generating prompts for a Procedural 3D WebGL motion graphics engine, NOT a photorealistic AI video generator. Focus ONLY on abstract elements: neon grids, glowing particles, HUD interfaces, geometric floating data nodes, cinematic lighting, wireframes. Output strictly a single CSV line: prompt,category,colorTheme,complexity,motionStyle" },
        { role: "user", content: `Headlines: ${headlines}. Hot Keywords: ${hotKeywords}. Create 1 highly cinematic 3D procedural video prompt matching these trends. No headers.` }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    const csvLine = data.choices[0].message.content.trim().replace(/`/g, '');
    fs.writeFileSync('data/prompts.csv', `prompt,category,colorTheme,complexity,motionStyle\n${csvLine}`);
    console.log("✅ TREND INJECTED INTO CSV!");
  } catch (error) {
    console.error("❌ Trend Catching failed:", error);
    process.exit(1);
  }
}
catchTrends();
