import fs from 'fs';

function getNextTopic(): { topic: string; jobIndex: number } {
  const promptsPath = 'data/prompts.csv';
  const usedTopicsPath = 'data/used_topics.json';
  const jobIndex = parseInt(process.env.JOB_INDEX || '0', 10);

  if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
  }

  if (!fs.existsSync(usedTopicsPath)) {
    fs.writeFileSync(usedTopicsPath, JSON.stringify([], null, 2));
  }

  let usedTopics: string[] = [];
  try {
    const rawUsed = fs.readFileSync(usedTopicsPath, 'utf-8');
    usedTopics = JSON.parse(rawUsed);
    if (!Array.isArray(usedTopics)) usedTopics = [];
  } catch {
    usedTopics = [];
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
        if (match) {
          topic = match[1];
        } else {
          topic = topic.replace(/^"+|"+$/g, '');
        }
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
      "Quantum Solid Data Matrix Flow",
      "Algorithmic Candlestick High Frequency Finance",
      "Synthetic DNA Double Helix Molecular Array",
      "Smart Calendar Real-Time Cloud Synchronization",
      "Abstract Displaced Tech Waves Real-time 4K"
    ];
  }

  let freshTopics = topics.filter(t => !usedTopics.includes(t));

  if (freshTopics.length === 0) {
    console.log("🔄 All topics in queue have been used! Resetting memory in used_topics.json...");
    usedTopics = [];
    fs.writeFileSync(usedTopicsPath, JSON.stringify([], null, 2));
    freshTopics = [...topics];
  }

  const selectedTopic = freshTopics[jobIndex % freshTopics.length];

  if (!usedTopics.includes(selectedTopic)) {
    usedTopics.push(selectedTopic);
    fs.writeFileSync(usedTopicsPath, JSON.stringify(usedTopics, null, 2));
  }

  console.log(`🎯 JOB INDEX ${jobIndex} SELECTED UNIQUE FRESH TOPIC (${usedTopics.length}/${topics.length} used): "${selectedTopic}"`);
  return { topic: selectedTopic, jobIndex };
}

interface HistoryItem {
  timestamp: string;
  title: string;
  renderModes: string[];
  engine3D: any;
  engine2D?: any;
}

function validateWithCritic(candidate: any, history: HistoryItem[]): { valid: boolean; reason?: string } {
  const title = candidate.seoPackage?.title || candidate.title;
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return { valid: false, reason: "REJECTED: Title is missing or too short." };
  }

  const seoTags = candidate.seoPackage?.seoTags || candidate.seoTags;
  if (!Array.isArray(seoTags) || seoTags.length < 10) {
    return { valid: false, reason: "REJECTED: SEO tags count is insufficient (must be at least 10 high-quality niche tags)." };
  }

  if (!Array.isArray(candidate.renderModes) || !candidate.renderModes.includes("3D")) {
    return { valid: false, reason: "REJECTED: '3D' renderMode is strictly MANDATORY for all generations." };
  }

  const validGeometries = ["BoxGeometry", "SphereGeometry", "CylinderGeometry", "TorusGeometry"];
  const geom = candidate.engine3D?.solidGeometry;
  if (geom && !validGeometries.includes(geom)) {
    return { valid: false, reason: `REJECTED: solidGeometry '${geom}' must be one of: ${validGeometries.join(', ')}.` };
  }

  const validMath = ["grid", "concentric_rings", "dna_helix", "wave_plane"];
  const math = candidate.engine3D?.layoutMath;
  if (math && !validMath.includes(math)) {
    return { valid: false, reason: `REJECTED: layoutMath '${math}' must be one of: ${validMath.join(', ')}.` };
  }

  const validCameraPaths = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];
  const camPath = candidate.engine3D?.cinematographyDP?.cameraPath;
  if (camPath && !validCameraPaths.includes(camPath)) {
    return { valid: false, reason: `REJECTED: cinematographyDP.cameraPath '${camPath}' must be one of: ${validCameraPaths.join(', ')}.` };
  }

  for (const past of history) {
    const candTitleLower = title.toLowerCase();
    const pastTitleLower = past.title?.toLowerCase() || '';
    if (candTitleLower === pastTitleLower || (candTitleLower.length > 10 && pastTitleLower.includes(candTitleLower))) {
      return { valid: false, reason: `REJECTED: Title "${title}" is too similar to past run "${past.title}".` };
    }
  }

  return { valid: true };
}

async function generate() {
  console.log("🚀 INITIATING DUAL-AGENT VIRTUAL DP CINEMATOGRAPHY DIRECTOR (NVIDIA 550B)...");
  
  const apiKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join(""); 
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const model = "nvidia/nemotron-3-ultra-550b-a55b";

  const { topic: promptContent, jobIndex } = getNextTopic();
  const historyPath = 'data/history_log.json';

  let history: HistoryItem[] = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
  }

  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  let approvedJson: any = null;
  let rejectionFeedback = "";

  while (attempt < MAX_ATTEMPTS && !approvedJson) {
    attempt++;
    console.log(`⏳ [Actor Generator & Virtual DP] Attempt ${attempt} of ${MAX_ATTEMPTS}...`);

    let userPrompt = `Analyze the trending topic: "${promptContent}".
You are the Lead Visual Director and Director of Photography (Virtual DP).
Stock footage requires slow, hypnotic, and continuous camera movements. Never generate fast or erratic cuts.

You MUST ALWAYS generate an abstract 3D visual metaphor (engine3D) for EVERY topic, using only SOLID geometries and slow continuous cinematography. If the topic heavily leans towards software/apps/UI/platforms/tools, add '2D' to the renderModes array and populate the engine2D parameters. NEVER omit the 3D generation.

Output STRICT JSON conforming to this schema:
{
  "seoPackage": {
    "title": "string (unique, cinematic, highly descriptive title)",
    "description": "string (engaging description)",
    "seoTags": ["array of 30-50 high-quality niche trending stock video tags"]
  },
  "renderModes": ["3D"] | ["3D", "2D"],
  "engine3D": {
    "solidGeometry": "BoxGeometry" | "SphereGeometry" | "CylinderGeometry" | "TorusGeometry",
    "layoutMath": "grid" | "concentric_rings" | "dna_helix" | "wave_plane",
    "physicalMaterial": { "metalness": 0.9, "roughness": 0.1 },
    "cinematographyDP": {
      "cameraPath": "slow_orbit" | "smooth_dolly_in" | "macro_pan_up",
      "pacing": "extremely_slow_and_cinematic",
      "focusDistance": 0
    },
    "colors": ["#hex1", "#hex2", "#hex3"],
    "cameraSpeed": 1.0,
    "bloomIntensity": 2.0,
    "complexity": 1.2
  },
  "engine2D": {
    "style": "hud_interface" | "minimal_ui_cards" | "typographic_kinetic",
    "colors": ["#hex1", "#hex2", "#hex3"],
    "textLayers": ["3 to 4 short bullet/feature texts to display"]
  }
}`;

    if (rejectionFeedback) {
      userPrompt += `\n\nCRITICAL DIRECTIVE FROM CRITIC AGENT: ${rejectionFeedback} Generate a completely unique, highly complex configuration.`;
    }

    const payload = {
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are an elite Hollywood Director of Photography and 3D Motion Graphics Architect. Output STRICT JSON only. Absolutely NO markdown outside the JSON. All 3D visuals must use solid PBR geometries with smooth, hypnotic cinematography (slow_orbit, smooth_dolly_in, or macro_pan_up). 3D is ALWAYS MANDATORY. If software/UI/app, renderModes is [\"3D\", \"2D\"]." 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ],
      temperature: 0.85,
      max_tokens: 4096
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error(`⚠️ Nvidia API Error on attempt ${attempt}:`, data.error.message || data.error);
        if (attempt === MAX_ATTEMPTS) break;
        await new Promise(res => setTimeout(res, 2000)); 
        continue;
      }

      if (data.choices && data.choices[0]) {
        let rawText = data.choices[0].message.content;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        
        const candidate = JSON.parse(jsonStr);

        // Ensure 3D is always present
        if (!Array.isArray(candidate.renderModes)) candidate.renderModes = ["3D"];
        if (!candidate.renderModes.includes("3D")) candidate.renderModes.unshift("3D");

        // Ensure cinematographyDP default
        if (!candidate.engine3D?.cinematographyDP) {
          candidate.engine3D = candidate.engine3D || {};
          candidate.engine3D.cinematographyDP = {
            cameraPath: "slow_orbit",
            pacing: "extremely_slow_and_cinematic",
            focusDistance: 0
          };
        }

        // Set top-level aliases for backward compatibility
        candidate.title = candidate.seoPackage?.title || candidate.title || "Solid 3D Procedural Scene";
        candidate.seoTags = candidate.seoPackage?.seoTags || candidate.seoTags || [];
        candidate.colors = candidate.engine3D?.colors || candidate.colors || ["#00f0ff", "#ff007f", "#7000ff"];

        console.log(`🔍 [Critic Agent] Evaluating Candidate: "${candidate.title}" (DP Path: ${candidate.engine3D?.cinematographyDP?.cameraPath}, Modes: ${candidate.renderModes.join(' + ')})...`);
        const criticResult = validateWithCritic(candidate, history);

        if (criticResult.valid) {
          console.log(`✅ [Critic Agent] APPROVED! Candidate passed Virtual DP validation.`);
          approvedJson = candidate;
        } else {
          console.warn(`🛑 [Critic Agent] ${criticResult.reason}`);
          rejectionFeedback = criticResult.reason || "Previous output was rejected.";
        }
      }
    } catch (err: any) {
      console.error(`❌ Parse/Network Error on attempt ${attempt}:`, err.message);
      await new Promise(res => setTimeout(res, 1500));
    }
  }

  if (!approvedJson) {
    console.warn("⚠️ Critic validation or API limits reached. Generating dynamic Virtual DP fallback config.");
    const isSoftwareUI = promptContent.toLowerCase().includes("app") ||
                         promptContent.toLowerCase().includes("calendar") ||
                         promptContent.toLowerCase().includes("software") ||
                         promptContent.toLowerCase().includes("tool") ||
                         promptContent.toLowerCase().includes("traffic") ||
                         promptContent.toLowerCase().includes("feature");

    const renderModes: ("3D" | "2D")[] = isSoftwareUI ? ["3D", "2D"] : ["3D"];
    const cameraPaths: ("slow_orbit" | "smooth_dolly_in" | "macro_pan_up")[] = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];
    const chosenCam = cameraPaths[Math.floor(Math.random() * cameraPaths.length)];

    approvedJson = {
      seoPackage: {
        title: `Cinematic 3D Procedural Visual: ${promptContent}`,
        description: `4K High-End Motion Graphics Visualization for ${promptContent}`,
        seoTags: ["solid 3d", "4k", "procedural", "motion graphics", "stock video", "pbr materials", "adobe stock", "cinematic camera"]
      },
      renderModes: renderModes,
      engine3D: {
        solidGeometry: "BoxGeometry",
        layoutMath: "wave_plane",
        physicalMaterial: { metalness: 0.9, roughness: 0.1 },
        cinematographyDP: {
          cameraPath: chosenCam,
          pacing: "extremely_slow_and_cinematic",
          focusDistance: 0
        },
        colors: ["#00f0ff", "#ff007f", "#7000ff"],
        cameraSpeed: 1.0,
        bloomIntensity: 2.0,
        complexity: 1.2
      },
      engine2D: isSoftwareUI ? {
        style: "minimal_ui_cards",
        colors: ["#3b82f6", "#10b981", "#8b5cf6"],
        textLayers: ["Automated Processing", "Real-Time Cloud Sync", "Intelligent Analytics", "Secure Architecture"]
      } : undefined,
      title: `Cinematic 3D Procedural Visual: ${promptContent}`,
      solid_core: "abstract_solid_waves",
      sceneType: "abstract_solid_waves",
      movementStyle: "quantum_flow",
      colors: ["#00f0ff", "#ff007f", "#7000ff"],
      cameraSpeed: 1.0,
      bloomIntensity: 2.0,
      complexity: 1.2
    };
  }

  const historyEntry: HistoryItem = {
    timestamp: new Date().toISOString(),
    title: approvedJson.seoPackage?.title || approvedJson.title,
    renderModes: approvedJson.renderModes,
    engine3D: approvedJson.engine3D,
    engine2D: approvedJson.engine2D
  };

  history.push(historyEntry);
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  fs.writeFileSync('data/sceneData.json', JSON.stringify(approvedJson, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(approvedJson, null, 2));
  
  const seoTitle = approvedJson.seoPackage?.title || approvedJson.title || "Procedural 3D Stock Visual";
  const tags = Array.isArray(approvedJson.seoPackage?.seoTags)
    ? approvedJson.seoPackage.seoTags.join(", ")
    : Array.isArray(approvedJson.seoTags)
    ? approvedJson.seoTags.join(", ")
    : "3d, solid geometry, 4k, r3f, procedural, stock footage";

  const metadataContent = `TITLE:\n${seoTitle}\n\nMODES:\n${approvedJson.renderModes.join(", ")}\n\nDP CAMERA:\n${approvedJson.engine3D?.cinematographyDP?.cameraPath || "slow_orbit"}\n\nTAGS:\n${tags}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`✅ VIRTUAL DP DIRECTED SCENE SAVED FOR JOB ${jobIndex} (CAMERA: ${approvedJson.engine3D?.cinematographyDP?.cameraPath})!`);
}

generate();
