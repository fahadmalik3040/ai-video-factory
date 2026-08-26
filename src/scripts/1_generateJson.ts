import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const OUT_FILE = path.resolve("src/data/videoConfig.json");

const FALLBACK_CONFIG = {
  job2D: { trendTopic: "Cinematic Ethereal Waves", clipCategory: "abstract_fluid", colorTheme: "#ff0055" },
  job3D: { trendTopic: "Quantum Particle Matrix", clipCategory: "sci_fi_particles", colorTheme: "#00ffcc", particleCount: 25000 }
};

const STYLES = ["Cinematic", "Cyberpunk", "Ethereal", "Abstract Sci-Fi", "Liquid Metal"];
const ELEMENTS = ["Neon Topography", "Crystal Matrix", "Black Hole Singularity", "Magnetic Fields", "Quantum Strings"];
const PALETTES = ["Neon Pink & Cyan", "Deep Emerald & Gold", "Crimson & Obsidian", "Sunset Orange & Violet", "Monochrome Silver & Blue"];

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchNvidiaData(retries = 2, delay = 1000) {
  const forceStyle = getRandom(STYLES);
  const forceElement = getRandom(ELEMENTS);
  const forceColor = getRandom(PALETTES);

  const dynamicPrompt = `You are the Creative Director for an Envato Stock Footage Empire.
TODAY'S STRICT MANDATE: Build a scene based EXACTLY on these parameters:
- Visual Style: ${forceStyle}
- Main Element: ${forceElement}
- Color Palette: ${forceColor}

Generate TWO distinct cinematic concepts.
1. job2D: Provide a 'trendTopic', 'clipCategory', and a vibrant HEX 'colorTheme'.
2. job3D: Provide a 'trendTopic', 'clipCategory', a HEX 'colorTheme', and set 'particleCount' strictly to 25000.

CRITICAL: ONLY OUTPUT JSON. DO NOT WRITE ANY GLSL CODE. NO MARKDOWN.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⚡ Querying Nvidia AI via AXIOS (Attempt ${attempt}/${retries})...`);
      const response = await axios.post(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        { model: "meta/llama-3.1-70b-instruct", messages: [{ role: "system", content: dynamicPrompt }, { role: "user", content: "Generate JSON config NOW." }], temperature: 0.99, max_tokens: 1000 },
        { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}` }, timeout: 15000 }
      );
      let clean = response.data.choices[0].message.content.replace(/```json/gi, '').replace(/```glsl/gi, '').replace(/```/g, '').trim().replace(/[\u0000-\u001F]+/g, ""); 
      if (!clean.startsWith('{')) clean = clean.substring(clean.indexOf('{'));
      if (!clean.endsWith('}')) clean = clean.substring(0, clean.lastIndexOf('}') + 1);
      return JSON.parse(clean);
    } catch (error: any) {
      if (attempt === retries) throw error; 
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  if (fs.existsSync(OUT_FILE)) fs.removeSync(OUT_FILE);
  let finalConfig;
  try {
    finalConfig = await fetchNvidiaData();
  } catch (error) {
    finalConfig = FALLBACK_CONFIG;
  }
  fs.ensureDirSync(path.dirname(OUT_FILE));
  fs.writeJsonSync(OUT_FILE, finalConfig, { spaces: 2 });
  console.log("🎉 Data saved to", OUT_FILE);
}

main().catch(err => {
  fs.ensureDirSync(path.dirname(OUT_FILE));
  fs.writeJsonSync(OUT_FILE, FALLBACK_CONFIG, { spaces: 2 });
});
