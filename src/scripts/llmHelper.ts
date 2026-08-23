import fs from 'fs';

export function getJobTopic(): { topic: string; jobIndex: number } {
  const promptsPath = 'data/prompts.csv';
  const jobIndex = parseInt(process.env.JOB_INDEX || '0', 10);

  if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
  }

  let topics: string[] = [];
  if (fs.existsSync(promptsPath)) {
    const content = fs.readFileSync(promptsPath, 'utf-8');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line.toLowerCase().startsWith('prompt,')) continue;
      
      let topic = line;
      if (topic.startsWith('"')) {
        const match = topic.match(/^"([^"]+)"/);
        if (match) topic = match[1];
        else topic = topic.replace(/^"+|"+$/g, '');
      } else if (topic.includes(',')) {
        topic = topic.split(',')[0];
      }
      topic = topic.trim();
      if (topic && !topics.includes(topic)) {
        topics.push(topic);
      }
    }
  }

  if (topics.length === 0) {
    topics = [
      "AI Neural Network Data Flow",
      "Neon Cyberpunk HUD Hologram",
      "Velocity Motion Blur Abstract",
      "Cinematic Light Leaks Overlay",
      "Liquid Glass Morphing Prism",
      "Quantum Computing Glowing Nodes",
      "Parametric Audio Spectrum Waves",
      "Kinetic Geometric Bauhaus Grid",
      "Biotech DNA Double Helix Evolution",
      "Stock Market Finance Candlesticks"
    ];
  }

  const selectedTopic = topics[jobIndex % topics.length];
  return { topic: selectedTopic, jobIndex };
}

export function sanitizeAndParseJson(raw: string) {
  try {
    // 1. Remove markdown formatting if the LLM wrapped it in ```json ... ```
    let clean = raw.replace(/^[\s\S]*?```json/i, '').replace(/```[\s\S]*?$/i, '').trim();
    if (!clean.startsWith('{') && clean.includes('{')) {
       clean = clean.substring(clean.indexOf('{'));
    }
    if (!clean.endsWith('}') && clean.includes('}')) {
       clean = clean.substring(0, clean.lastIndexOf('}') + 1);
    }
    
    // 2. Aggressively strip raw control characters (like unescaped newlines/tabs inside strings)
    // By removing actual line breaks, we force the JSON into a parseable state even if the LLM messed up.
    clean = clean.replace(/[\u0000-\u001F]+/g, ""); 

    return JSON.parse(clean);
  } catch (error) {
    console.error("❌ JSON Parsing failed! Raw AI Output was:");
    console.error(raw);
    throw error;
  }
}

export function getDynamicPalette(topic: string, seed: string): string[] {
  const palettes = [
    ["#00f0ff", "#ff007f", "#7000ff", "#00ffaa"],
    ["#ff3366", "#33ccff", "#ffcc00", "#9933ff"],
    ["#00ffcc", "#ff0066", "#cc00ff", "#ffffff"],
    ["#ff9900", "#ff0033", "#6600cc", "#00ccff"],
    ["#33ff33", "#0099ff", "#ff0099", "#ffff00"],
    ["#e0e7ff", "#6366f1", "#a855f7", "#ec4899"],
    ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
    ["#f43f5e", "#8b5cf6", "#06b6d4", "#10b981"],
    ["#fbbf24", "#f87171", "#c084fc", "#60a5fa"],
    ["#4ade80", "#22d3ee", "#e879f9", "#facc15"]
  ];
  let hash = 0;
  for (let i = 0; i < (topic + seed).length; i++) {
    hash = (hash << 5) - hash + (topic + seed).charCodeAt(i);
    hash |= 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}
