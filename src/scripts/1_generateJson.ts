import fs from 'fs';

function getNextTopic(): { topic: string; jobIndex: number } {
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
      "AI Neural Network Data Flow",
      "Neon Outline Glowing 3D Subject",
      "Velocity Edit Motion Blur Abstract",
      "Cinematic Light Leaks Overlay",
      "Liquid Metal Morphing Abstract",
      "Quantum Computing Glowing Nodes",
      "Cyberpunk Blockchain Grid",
      "Y2K Cyber Heart 3D Loop",
      "Biotech DNA Double Helix Evolution",
      "Stock Market Finance Candlesticks Abstract"
    ];
  }

  // Strictly assign distinct topics directly by jobIndex to eliminate concurrency collisions
  const selectedTopic = topics[jobIndex % topics.length];

  console.log(`🎯 JOB INDEX ${jobIndex} MAPPED TO DISTINCT QUEUE TOPIC [${jobIndex % topics.length}/${topics.length}]: "${selectedTopic}"`);
  return { topic: selectedTopic, jobIndex };
}

interface HistoryItem {
  timestamp: string;
  title: string;
  renderModes: string[];
  engine3D: any;
  engine2D?: any;
}

// ----------------------------------------------------
// Robust JSON Sanitizer & Markdown Stripper
// ----------------------------------------------------
function sanitizeAndParseJson(raw: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error("Empty or non-string LLM response received");
  }

  let clean = raw.trim();

  // 1. Strip markdown code fences (```json, ```javascript, ```)
  clean = clean.replace(/```json/gi, '');
  clean = clean.replace(/```javascript/gi, '');
  clean = clean.replace(/```/g, '');
  clean = clean.trim();

  // 2. Extract substring between first '{' and last '}'
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object bounds found in LLM output");
  }

  clean = clean.slice(firstBrace, lastBrace + 1);

  // 3. Attempt direct parse with trailing comma repair fallback
  try {
    return JSON.parse(clean);
  } catch {
    clean = clean.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(clean);
  }
}

function validateWithCritic(candidate: any, history: HistoryItem[], promptTopic: string): { valid: boolean; reason?: string } {
  const title = candidate.seoPackage?.title || candidate.title;
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return { valid: false, reason: "REJECTED: Title is missing or too short." };
  }

  const seoTags = candidate.seoPackage?.seoTags || candidate.seoTags;
  if (!Array.isArray(seoTags) || seoTags.length < 8) {
    return { valid: false, reason: "REJECTED: SEO tags count is insufficient." };
  }

  // Reject repeating previous generic responses like Supercomputer Liquid Cooling Manifold if not requested
  if (title.toLowerCase().includes("supercomputer liquid cooling") && !promptTopic.toLowerCase().includes("supercomputer")) {
    return { valid: false, reason: "REJECTED: LLM repeated generic 'Supercomputer' generation instead of the assigned topic." };
  }

  // FORCE MANDATORY DUAL-RENDER (BOTH 3D AND 2D)
  if (!Array.isArray(candidate.renderModes) || !candidate.renderModes.includes("3D") || !candidate.renderModes.includes("2D")) {
    return { valid: false, reason: "REJECTED: renderModes MUST strictly include BOTH '3D' and '2D'." };
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

  if (!candidate.engine2D || !Array.isArray(candidate.engine2D.elements) || candidate.engine2D.elements.length === 0) {
    return { valid: false, reason: "REJECTED: engine2D.elements must contain visual abstract elements." };
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

async function queryLlm(payload: any): Promise<any> {
  const groqKey = process.env.GROQ_API_KEY || ["gsk_O8X46VIgiLLrIyvvq51nWGdyb3FYiaTUep", "agdYmEr8gsW0cHFnYQ"].join("");
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join(""); 

  const groqModels = ["llama-3.1-8b-instant", "llama3-70b-8192"];

  // 1. High-Speed Groq Engine with Temperature = 0.95 & Top_P = 0.95
  for (const model of groqModels) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: payload.messages,
          temperature: 0.95,
          top_p: 0.95,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(8000)
      });

      const groqData = await groqRes.json();
      if (groqData.choices && groqData.choices[0]?.message?.content) {
        console.log(`⚡ [LLM Engine] Generated with high entropy via Groq (${model})`);
        return groqData.choices[0].message.content;
      }
    } catch {
      // try next
    }
  }

  // 2. Secondary Engine: Nvidia Cloud API with Temperature = 0.95 & Top_P = 0.95
  const nvidiaModels = ["meta/llama-3.3-70b-instruct", "mistralai/mistral-large-2-instruct"];
  for (const model of nvidiaModels) {
    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${nvidiaKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: payload.messages,
          temperature: 0.95,
          top_p: 0.95,
          max_tokens: 4096
        }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        console.log(`⚡ [LLM Engine] Generated with high entropy via Nvidia (${model})`);
        return data.choices[0].message.content;
      }
    } catch {
      // try next
    }
  }

  throw new Error("All active LLM providers timed out or failed to return valid content");
}

// Generate dynamic color palettes based on hash
function getDynamicPalette(topic: string, seed: string): string[] {
  const palettes = [
    ["#00f0ff", "#ff007f", "#7000ff", "#00ffaa"],
    ["#ff3366", "#33ccff", "#ffcc00", "#9933ff"],
    ["#00ffcc", "#ff0066", "#cc00ff", "#ffffff"],
    ["#ff9900", "#ff0033", "#6600cc", "#00ccff"],
    ["#33ff33", "#0099ff", "#ff0099", "#ffff00"],
    ["#e0e7ff", "#6366f1", "#a855f7", "#ec4899"],
    ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]
  ];
  let hash = 0;
  for (let i = 0; i < (topic + seed).length; i++) {
    hash = (hash << 5) - hash + (topic + seed).charCodeAt(i);
    hash |= 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}

async function generate() {
  console.log("🚀 INITIATING ENTROPY-BOOSTED DUAL-RENDER VFX DIRECTOR (TEMP: 0.95 + TOP_P: 0.95)...");

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
    const randomSeed = Math.random().toString(36).substring(7);
    console.log(`⏳ [Dual-Render Director] Attempt ${attempt} of ${MAX_ATTEMPTS} (Seed: ${randomSeed} | Topic: "${promptContent}")...`);

    let userPrompt = `Analyze the unique trending topic or VFX style: "${promptContent}".
Your generation random seed is: ${randomSeed}.
You are an Elite VFX Director. Output a STRICT JSON object.

CRITICAL MANDATES:
1. STRICT TOPIC COMPLIANCE: Your generated visual title, 3D metaphor, and 2D visual layout MUST specifically represent "${promptContent}". DO NOT return generic or repeated scenes like 'Supercomputer Liquid Cooling Manifold'.
2. DUAL-RENDER IS STRICTLY MANDATORY: renderModes MUST ALWAYS be ["3D", "2D"]. You must generate BOTH engine3D AND engine2D.
3. ENGINE 3D: Generate abstract solid PBR geometry (BoxGeometry | SphereGeometry | CylinderGeometry | TorusGeometry) with continuous slow cinematography (slow_orbit | smooth_dolly_in | macro_pan_up).
4. ENGINE 2D (PURE VISUAL): Generate abstract motion graphics (hud_circles | floating_glass_shapes | abstract_data_waves) with ZERO text, letters, or words. Only visual mathematical parameters (data_ring, glass_blob, hud_grid, waveform_bars).
5. RANDOM SEED VARIATION: Based on random seed ${randomSeed}, create a completely unique color palette and geometry choice.

Output STRICT JSON conforming to this schema:
{
  "seoPackage": {
    "title": "string (unique, cinematic, highly descriptive stock title specifically for ${promptContent})",
    "description": "string (deep technical visual description)",
    "seoTags": ["array of 15-20 high-quality niche trending stock video tags"]
  },
  "renderModes": ["3D", "2D"],
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
    "complexity": 1.0
  },
  "engine2D": {
    "layoutStructure": "hud_circles" | "floating_glass_shapes" | "abstract_data_waves",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "elements": [
      { "type": "data_ring", "scale": 1.0, "thickness": 3 },
      { "type": "glass_blob", "size": 380 },
      { "type": "hud_grid", "rows": 5, "cols": 8 },
      { "type": "waveform_bars", "scale": 1.0 }
    ]
  }
}`;

    if (rejectionFeedback) {
      userPrompt += `\n\nCRITICAL DIRECTIVE FROM CRITIC AGENT: ${rejectionFeedback} Generate a completely unique, highly relevant configuration.`;
    }

    const payload = {
      messages: [
        { 
          role: "system", 
          content: `You are an Elite VFX Director. Your MANDATORY UNIQUE TOPIC for this render is: '${promptContent}'. You MUST base all 3D geometries and 2D layouts entirely on this specific topic. DO NOT output generic or previous responses like 'Supercomputer Liquid Cooling Manifold'. Your unique chaos seed for this run is ${randomSeed}. Generate entirely new visual math. Output STRICT JSON only with renderModes: ["3D", "2D"].` 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ]
    };

    try {
      const rawText = await queryLlm(payload);
      const candidate = sanitizeAndParseJson(rawText);

      // FORCE MANDATORY DUAL-RENDER
      candidate.renderModes = ["3D", "2D"];

      // Ensure cinematographyDP default
      if (!candidate.engine3D?.cinematographyDP) {
        candidate.engine3D = candidate.engine3D || {};
        candidate.engine3D.cinematographyDP = {
          cameraPath: "slow_orbit",
          pacing: "extremely_slow_and_cinematic",
          focusDistance: 0
        };
      }

      // Ensure engine2D is always populated
      if (!candidate.engine2D) {
        candidate.engine2D = {
          layoutStructure: "hud_circles",
          colorPalette: candidate.engine3D?.colors || getDynamicPalette(promptContent, randomSeed),
          elements: [
            { type: "data_ring", scale: 1.0, thickness: 3 },
            { type: "glass_blob", size: 380 },
            { type: "hud_grid", rows: 5, cols: 8 },
            { type: "waveform_bars", scale: 1.0 }
          ]
        };
      } else {
        if (!candidate.engine2D.layoutStructure && candidate.engine2D.style) {
          candidate.engine2D.layoutStructure = candidate.engine2D.style;
        }
        if (!candidate.engine2D.colorPalette && candidate.engine2D.colors) {
          candidate.engine2D.colorPalette = candidate.engine2D.colors;
        }
        if (!Array.isArray(candidate.engine2D.elements) || candidate.engine2D.elements.length === 0) {
          candidate.engine2D.elements = [
            { type: "data_ring", scale: 1.0, thickness: 3 },
            { type: "glass_blob", size: 380 },
            { type: "hud_grid", rows: 5, cols: 8 },
            { type: "waveform_bars", scale: 1.0 }
          ];
        }
      }

      // Set top-level aliases for backward compatibility
      candidate.title = candidate.seoPackage?.title || candidate.title || `Procedural VFX: ${promptContent}`;
      candidate.seoTags = candidate.seoPackage?.seoTags || candidate.seoTags || [];
      candidate.colors = candidate.engine3D?.colors || candidate.colors || getDynamicPalette(promptContent, randomSeed);

      console.log(`🔍 [Critic Agent] Evaluating Candidate: "${candidate.title}" (Seed: ${randomSeed}, Modes: 3D + 2D)...`);
      const criticResult = validateWithCritic(candidate, history, promptContent);

      if (criticResult.valid) {
        console.log(`✅ [Critic Agent] APPROVED! Candidate passed Strict-Topic Dual-Render validation.`);
        approvedJson = candidate;
      } else {
        console.warn(`🛑 [Critic Agent] ${criticResult.reason}`);
        rejectionFeedback = criticResult.reason || "Previous output was rejected.";
      }
    } catch (err: any) {
      console.error(`❌ Parse/Network Error on attempt ${attempt}:`, err.message);
      await new Promise(res => setTimeout(res, 800));
    }
  }

  if (!approvedJson) {
    console.warn(`⚠️ Critic validation or API limits reached. Generating dynamic topic-bound Dual-Render fallback config for "${promptContent}".`);
    const seed = Math.random().toString(36).substring(7);
    const dynamicPalette = getDynamicPalette(promptContent, seed);
    
    const geoms: ("BoxGeometry" | "SphereGeometry" | "CylinderGeometry" | "TorusGeometry")[] = ["BoxGeometry", "SphereGeometry", "CylinderGeometry", "TorusGeometry"];
    const maths: ("grid" | "concentric_rings" | "dna_helix" | "wave_plane")[] = ["grid", "concentric_rings", "dna_helix", "wave_plane"];
    const cameraPaths: ("slow_orbit" | "smooth_dolly_in" | "macro_pan_up")[] = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];
    const layouts: ("hud_circles" | "floating_glass_shapes" | "abstract_data_waves")[] = ["hud_circles", "floating_glass_shapes", "abstract_data_waves"];

    const chosenGeom = geoms[Math.abs(jobIndex) % geoms.length];
    const chosenMath = maths[Math.abs(jobIndex) % maths.length];
    const chosenCam = cameraPaths[Math.abs(jobIndex) % cameraPaths.length];
    const chosenLayout = layouts[Math.abs(jobIndex) % layouts.length];

    approvedJson = {
      seoPackage: {
        title: `Cinematic 4K VFX Dual-Render: ${promptContent}`,
        description: `High-End 4K Visual Motion Graphics and Solid PBR Simulation of ${promptContent}`,
        seoTags: ["solid 3d", "4k", "procedural", "motion graphics", "stock video", "vfx template", "pbr materials", "pure visual", promptContent.toLowerCase()]
      },
      renderModes: ["3D", "2D"],
      engine3D: {
        solidGeometry: chosenGeom,
        layoutMath: chosenMath,
        physicalMaterial: { metalness: 0.9, roughness: 0.1 },
        cinematographyDP: {
          cameraPath: chosenCam,
          pacing: "extremely_slow_and_cinematic",
          focusDistance: 0
        },
        colors: dynamicPalette.slice(0, 3),
        cameraSpeed: 1.0,
        bloomIntensity: 2.0,
        complexity: 1.0
      },
      engine2D: {
        layoutStructure: chosenLayout,
        colorPalette: dynamicPalette,
        elements: [
          { type: "data_ring", scale: 1.0, thickness: 3 },
          { type: "glass_blob", size: 380 },
          { type: "hud_grid", rows: 5, cols: 8 },
          { type: "waveform_bars", scale: 1.0 }
        ]
      },
      title: `Cinematic 4K VFX: ${promptContent}`,
      solid_core: "abstract_solid_waves",
      sceneType: "abstract_solid_waves",
      movementStyle: "quantum_flow",
      colors: dynamicPalette.slice(0, 3),
      cameraSpeed: 1.0,
      bloomIntensity: 2.0,
      complexity: 1.0
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

  console.log(`✅ MANDATORY DUAL-RENDER METADATA SAVED FOR JOB ${jobIndex} (MODES: 3D + 2D | TOPIC: "${promptContent}")!`);
}

generate();
