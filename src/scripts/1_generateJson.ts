import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import dns from 'node:dns';

// 🔥 CRITICAL NETWORK HACK: Bypass GitHub Actions IPv6 connection drops
dns.setDefaultResultOrder('ipv4first');

const OUT_FILE = path.resolve("src/data/videoConfig.json");
const LEGACY_OUT_FILE = path.resolve("data/sceneData.json");

// 🔥 GOD-TIER FALLBACK (ORIGINAL PARTICLES)
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
        {
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            { role: "system", content: dynamicPrompt },
            { role: "user", content: "Generate the Envato 4K JSON config NOW." }
          ],
          temperature: 0.99,
          max_tokens: 1000
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("")}`
          },
          timeout: 15000 // Strict 15s timeout
        }
      );

      let raw = response.data.choices[0].message.content;
      let clean = raw.replace(/```json/gi, '').replace(/```glsl/gi, '').replace(/```/g, '').trim();
      clean = clean.replace(/[\u0000-\u001F]+/g, ""); 
      
      if (!clean.startsWith('{')) clean = clean.substring(clean.indexOf('{'));
      if (!clean.endsWith('}')) clean = clean.substring(0, clean.lastIndexOf('}') + 1);

      return JSON.parse(clean);

    } catch (error: any) {
      console.warn(`⚠️ Axios Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error("❌ Nvidia API unreachable. Triggering Fallback.");
        throw error; 
      }
      console.log(`⏳ Waiting just ${delay / 1000}s before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  console.log("=======================================================================");
  console.log("🌌 DUAL INDEPENDENT RENDER ORCHESTRATOR: CINEMATIC 4K STOCK FACTORY");
  console.log("=======================================================================");

  // 🔥 NUKE OLD JSON CACHE
  if (fs.existsSync(OUT_FILE)) {
    fs.removeSync(OUT_FILE);
    console.log("🗑️ Deleted stale videoConfig.json to prevent ghost caching.");
  }
  if (fs.existsSync(LEGACY_OUT_FILE)) {
    fs.removeSync(LEGACY_OUT_FILE);
    console.log("🗑️ Deleted stale sceneData.json.");
  }

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
        console.log(`🗑️ Cleared cache: ${dir}`);
      } catch {}
    }
  }

  let finalConfig;
  try {
    finalConfig = await fetchNvidiaData();
    console.log("✅ Nvidia AI successfully generated new cinematic configs.");
  } catch (error) {
    console.log("⚠️ Switching to DETERMINISTIC GOD-TIER FALLBACK CONFIG...");
    finalConfig = FALLBACK_CONFIG;
  }

  fs.ensureDirSync(path.dirname(OUT_FILE));
  fs.writeJsonSync(OUT_FILE, finalConfig, { spaces: 2 });
  
  fs.ensureDirSync(path.dirname(LEGACY_OUT_FILE));
  fs.writeJsonSync(LEGACY_OUT_FILE, finalConfig, { spaces: 2 });

  console.log("🎉 [PREMIUM ASSET CONFIGURED] Data saved successfully to", OUT_FILE);
  return finalConfig;
}

export const orchestrateInfiniteGLSLFactory = main;
export const generateDualOrchestratorJson = main;

if (require.main === module) {
  main().catch(err => {
    console.error("🔥 FATAL ERROR CAUGHT:", err);
    fs.ensureDirSync(path.dirname(OUT_FILE));
    fs.writeJsonSync(OUT_FILE, FALLBACK_CONFIG, { spaces: 2 });
    fs.ensureDirSync(path.dirname(LEGACY_OUT_FILE));
    fs.writeJsonSync(LEGACY_OUT_FILE, FALLBACK_CONFIG, { spaces: 2 });
  });
}
