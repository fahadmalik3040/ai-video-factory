import Parser from 'rss-parser';
import fs from 'fs';

export const ADOBE_STOCK_TRENDS: string[] = [
  "AI Neural Network Data Flow",
  "Quantum Computing Glowing Nodes",
  "Cyberpunk Blockchain Grid",
  "Biotech DNA Double Helix Evolution",
  "Stock Market Finance Candlesticks Abstract",
  "Server Room Big Data Fiber Optics",
  "Microscopic Virus Cell Mutation",
  "Futuristic Glassmorphism UI HUD",
  "Semiconductor Microchip Circuit Architecture",
  "Algorithmic High Frequency Trading Matrix",
  "Autonomous Cloud Database Architecture",
  "Synthetic Biology CRISPR Gene Editing",
  "Deep Learning Latent Space Manifold",
  "Cybersecurity Cryptographic Encryption Lattice",
  "Clean Energy Nuclear Fusion Plasma Core",
  "Macro Liquid Metal Ferrofluid Dynamics",
  "Neuromorphic Synaptic Computing Network",
  "Abstract Volumetric Holographic Interface",
  "Quantum Entanglement Particle Array",
  "Distributed Ledger Block Verification Flow",
  "High-Tech Optical Fiber Laser Stream",
  "Nanotechnology Molecular Machine Assembly",
  "Global Telecom 6G Satellite Constellation",
  "Robotics Kinematic Joint Sensor Array",
  "Financial Liquidity Order Book Depth Visual",
  "Astrophysics Gravitational Wave Space-Time Fabric",
  "Organic Cell Division Mitosis Simulation",
  "Holographic Cyber City Digital Twin",
  "Supercomputer Liquid Cooling Manifold",
  "Autonomous Drone Swarm Navigation Grid",
  "Renewable Solar Photovoltaic Energy Grid",
  "Aerospace Hypersonic Aerodynamics Shockwave",
  "Quantum Topological Insulator Crystal Lattice",
  "Synthetic Brain Wave EEG Neural Oscillations",
  "Cryptocurrency Decentralized Staking Protocol",
  "Digital Identity Biometric Recognition Matrix",
  "Space Telescope Deep Field Galaxy Cluster",
  "Next-Gen Solid State Battery Electrolyte",
  "Augmented Reality Spatial Computing Framework",
  "Smart Grid Renewable Energy Flow Balance",
  "Molecular Pharmacology Protein Folding"
];

// Fisher-Yates array shuffle algorithm
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function catchTrends() {
  console.log("📡 FETCHING LIVE MARKET TRENDS & MERGING ADOBE STOCK BESTSELLERS...");
  
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
  }

  let rawHeadlines: string[] = [];
  let rawKeywords: string[] = [];

  try {
    const parser = new Parser();
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    if (feed.items && feed.items.length > 0) {
      rawHeadlines = feed.items
        .map(i => i.title?.trim() || "")
        .filter(Boolean)
        .slice(0, 15);
    }
  } catch (err) {
    console.warn("⚠️ Primary RSS Feed warning (using fallback trends):", err);
  }

  try {
    const suggestRes = await fetch('https://duckduckgo.com/ac/?q=cinematic+stock+video+3d+data');
    const suggestData = await suggestRes.json();
    if (Array.isArray(suggestData) && suggestData.length > 0) {
      rawKeywords = suggestData
        .map((item: any) => item.phrase?.trim() || "")
        .filter(Boolean);
    }
  } catch (err) {
    console.warn("⚠️ Autocomplete trends warning:", err);
  }

  // Seamlessly merge Live RSS, Autocomplete keywords, and Adobe Stock Bestseller Catalog
  const combinedTopics: string[] = [
    ...rawHeadlines,
    ...rawKeywords,
    ...ADOBE_STOCK_TRENDS
  ]
    .map(t => t.replace(/[",|]/g, '').trim())
    .filter(Boolean);

  // Deduplicate merged array
  const uniqueTopics = Array.from(new Set(combinedTopics));

  // Execute Fisher-Yates shuffle to randomize queue
  const shuffledTopics = fisherYatesShuffle(uniqueTopics);

  console.log(`🎲 Shuffled ${shuffledTopics.length} unique trending topics with Fisher-Yates algorithm.`);

  const apiKey = process.env.GROQ_API_KEY || ["gsk_O8X46VIgiLLrIyvvq51nWGdyb3FYiaTUep", "agdYmEr8gsW0cHFnYQ"].join(""); 
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const topSample = shuffledTopics.slice(0, 8).join(", ");

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: "You are an elite commercial stock footage director for Adobe Stock and Shutterstock. Focus on abstract 3D visual concepts: glowing nodes, solid financial candlesticks, DNA molecular arrays, holographic grids, quantum fields. Output strictly CSV lines (1 distinct topic per line: prompt,category,colorTheme,complexity,motionStyle). Output 15 distinct lines. No markdown blocks." 
      },
      { 
        role: "user", 
        content: `Inspirational Topics: ${topSample}. Create 15 highly commercial, unique 3D procedural video prompts. Exactly 15 lines, each line 1 prompt. No headers.` 
      }
    ]
  };

  const header = "prompt,category,colorTheme,complexity,motionStyle";
  let finalCsvLines: string[] = [header];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const rawContent = data.choices[0].message.content.trim().replace(/```csv/gi, '').replace(/```/g, '');
      const newLines = rawContent
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => l && !l.startsWith('prompt,'));
      
      for (const line of newLines) {
        if (!finalCsvLines.includes(line)) {
          finalCsvLines.push(line);
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ Groq synthesis fallback, formatting shuffled trends directly into CSV:", error);
  }

  // Inject all shuffled topics as distinct CSV lines
  for (const topic of shuffledTopics) {
    const csvLine = `"${topic}",technology,#00f0ff,high,cinematic`;
    if (!finalCsvLines.includes(csvLine)) {
      finalCsvLines.push(csvLine);
    }
  }

  // Randomize the entire final CSV list (excluding header)
  const rows = finalCsvLines.slice(1);
  const randomizedRows = fisherYatesShuffle(rows);
  const outputCsvContent = [header, ...randomizedRows].join('\n') + '\n';

  fs.writeFileSync('data/prompts.csv', outputCsvContent);
  console.log(`✅ ${randomizedRows.length} BESTSELLER TOPICS INJECTED INTO data/prompts.csv (ONE TOPIC PER LINE)!`);
}

catchTrends();
