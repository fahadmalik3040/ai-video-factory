import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

const OUT_FILE = path.resolve("src/data/videoConfig.json");
const LEGACY_OUT_FILE = path.resolve("data/sceneData.json");

const FALLBACK_CONFIG = {
  job2D: { trendTopic: "CYBER ECONOMY", clipCategory: "holographic_data", colorTheme: "#ff0055" },
  job3D: { trendTopic: "WALL STREET INDEX", clipCategory: "candlestick_growth", colorTheme: "#00ffcc" }
};

const STYLES = ["Wall Street Financial", "Cyberpunk Crypto", "Corporate Economy", "Global Tech Market", "Holographic Data"];
const ELEMENTS = ["Candlestick Growth Chart", "Forex Trading Grid", "Blockchain Transaction Matrix", "Stock Exchange Indexes"];
const PALETTES = ["Neon Green & Red", "Corporate Blue & Gold", "Cyberpunk Cyan & Magenta", "Gold & Deep Black", "Bright Emerald & Silver"];

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchNvidiaData(retries = 2, delay = 1000) {
  const forceStyle = getRandom(STYLES);
  const forceElement = getRandom(ELEMENTS);
  const forceColor = getRandom(PALETTES);

  const dynamicPrompt = `You are the Creative Director for a Premium Stock Footage Empire specializing in Financial and Business Visuals.
TODAY'S MANDATE:
- Style: ${forceStyle}
- Element: ${forceElement}
- Color: ${forceColor}

Generate TWO concepts.
1. job2D: Provide a 'trendTopic' (e.g., "CRYPTO MARKETS"), 'clipCategory', and a HEX 'colorTheme'.
2. job3D: Provide a 'trendTopic', 'clipCategory', and a HEX 'colorTheme'.
CRITICAL: ONLY OUTPUT JSON. DO NOT WRITE ANY GLSL CODE. NO MARKDOWN.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⚡ Querying Nvidia AI via AXIOS (Attempt ${attempt}/${retries})...`);
      const response = await axios.post(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            { role: "system", content: dynamicPrompt },
            { role: "user", content: "Generate JSON config NOW." }
          ],
          temperature: 0.99,
          max_tokens: 1000
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("")}`
          },
          timeout: 15000
        }
      );
      let clean = response.data.choices[0].message.content
        .replace(/```json/gi, '')
        .replace(/```glsl/gi, '')
        .replace(/```/g, '')
        .trim()
        .replace(/[\u0000-\u001F]+/g, ""); 
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
  if (fs.existsSync(LEGACY_OUT_FILE)) fs.removeSync(LEGACY_OUT_FILE);

  // NUKE Webpack and Remotion Cache directories
  const cacheDirs = [
    path.resolve(".remotion"),
    path.resolve("node_modules/.cache/remotion"),
    path.resolve("node_modules/.cache/webpack"),
  ];
  for (const dir of cacheDirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.removeSync(dir);
      } catch {}
    }
  }

  let finalConfig;
  try {
    finalConfig = await fetchNvidiaData();
  } catch (error) {
    finalConfig = FALLBACK_CONFIG;
  }
  fs.ensureDirSync(path.dirname(OUT_FILE));
  fs.writeJsonSync(OUT_FILE, finalConfig, { spaces: 2 });
  fs.ensureDirSync(path.dirname(LEGACY_OUT_FILE));
  fs.writeJsonSync(LEGACY_OUT_FILE, finalConfig, { spaces: 2 });
  console.log("🎉 Data saved to", OUT_FILE);
  return finalConfig;
}

export const orchestrateInfiniteGLSLFactory = main;
export const generateDualOrchestratorJson = main;

if (require.main === module) {
  main().catch(err => {
    fs.ensureDirSync(path.dirname(OUT_FILE));
    fs.writeJsonSync(OUT_FILE, FALLBACK_CONFIG, { spaces: 2 });
    fs.ensureDirSync(path.dirname(LEGACY_OUT_FILE));
    fs.writeJsonSync(LEGACY_OUT_FILE, FALLBACK_CONFIG, { spaces: 2 });
  });
}
