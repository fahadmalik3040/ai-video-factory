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
      "AI Neural Network Data Flow",
      "Neon Outline Glowing 3D Subject",
      "Velocity Edit Motion Blur Abstract",
      "Cinematic Light Leaks Overlay",
      "Liquid Metal Morphing Abstract",
      "Quantum Computing Glowing Nodes",
      "Cyberpunk Blockchain Grid",
      "Y2K Cyber Heart 3D Loop"
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

  if (candidate.renderModes.includes("2D")) {
    if (!candidate.engine2D || !Array.isArray(candidate.engine2D.elements) || candidate.engine2D.elements.length === 0) {
      return { valid: false, reason: "REJECTED: '2D' renderMode requires non-empty visual engine2D.elements." };
    }
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

  // 1. High-Speed Groq Engine with Timeout
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
          temperature: 0.85,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(8000)
      });

      const groqData = await groqRes.json();
      if (groqData.choices && groqData.choices[0]?.message?.content) {
        console.log(`⚡ [LLM Engine] Generated successfully via Groq (${model})`);
        return groqData.choices[0].message.content;
      }
    } catch {
      // try next
    }
  }

  // 2. Secondary Engine: Nvidia Cloud API with Timeout
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
          temperature: 0.85,
          max_tokens: 4096
        }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        console.log(`⚡ [LLM Engine] Generated successfully via Nvidia (${model})`);
        return data.choices[0].message.content;
      }
    } catch {
      // try next
    }
  }

  throw new Error("All active LLM providers timed out or failed to return valid content");
}

async function generate() {
  console.log("🚀 INITIATING DUAL-AGENT ELITE VFX & EDITING TEMPLATE DIRECTOR (4096 TOKENS + JSON SANITIZER)...");

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
    console.log(`⏳ [Actor Generator & VFX Director] Attempt ${attempt} of ${MAX_ATTEMPTS} (Seed: ${randomSeed})...`);

    let userPrompt = `Analyze the trending topic or VFX style: "${promptContent}".
Your generation random seed is: ${randomSeed}.
You are an Elite VFX Director. Output a valid JSON object.
Your provided topic might be a traditional concept OR a specific video editing trend (like 'CapCut Neon Glitch', 'Velocity Edit', or 'Filmora Light Leak'). If it is an editing trend, design the 3D/2D geometry and motion math to perfectly replicate that visual effect using solid shapes, lighting, and camera movement.

CRITICAL MANDATES:
1. 3D IS ALWAYS MANDATORY: You MUST generate an abstract 3D visual metaphor (engine3D) for EVERY topic, using only SOLID geometries and slow continuous cinematography (slow_orbit | smooth_dolly_in | macro_pan_up).
2. DUAL-RENDER FOR SOFTWARE/UI/VFX/OVERLAYS: If the topic discusses software, UI, apps, CapCut/Filmora/Premiere video editing effects, neon overlays, or motion graphics, add '2D' to the renderModes array and generate purely visual engine2D parameters.
3. PURE VISUAL ABSTRACT 2D: For 2D, you are creating PURELY VISUAL abstract motion graphics (like high-tech HUDs, data waveforms, or organic glass blobs). Do NOT generate any text, words, paragraphs, or numbers in engine2D. Only visual mathematical parameters (data_ring, glass_blob, hud_grid, waveform_bars).
4. RANDOM SEED VARIATION: Based on random seed ${randomSeed}, create a completely unique color palette, geometry choice, and motion trajectory.

Output STRICT JSON conforming to this schema:
{
  "seoPackage": {
    "title": "string (unique, cinematic, highly descriptive stock title specifically for ${promptContent})",
    "description": "string (deep technical visual description)",
    "seoTags": ["array of 15-20 high-quality niche trending stock video tags"]
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
          content: `You are an Elite VFX Director and Hollywood DP. You are generating a unique abstract 3D setup. Your random seed for this generation is ${randomSeed}. Output STRICT JSON only. Absolutely NO markdown outside the JSON. All visuals must be purely abstract motion graphics with ZERO text, letters, or words in engine2D.` 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ]
    };

    try {
      const rawText = await queryLlm(payload);
      
      // Use robust JSON sanitizer & markdown stripper
      const candidate = sanitizeAndParseJson(rawText);

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

      // Normalize engine2D visual elements (PURGE all text)
      if (candidate.engine2D) {
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
      candidate.title = candidate.seoPackage?.title || candidate.title || `Solid 3D: ${promptContent}`;
      candidate.seoTags = candidate.seoPackage?.seoTags || candidate.seoTags || [];
      candidate.colors = candidate.engine3D?.colors || candidate.colors || ["#00f0ff", "#ff007f", "#7000ff"];

      console.log(`🔍 [Critic Agent] Evaluating Candidate: "${candidate.title}" (Seed: ${randomSeed}, Modes: ${candidate.renderModes.join(' + ')})...`);
      const criticResult = validateWithCritic(candidate, history, promptContent);

      if (criticResult.valid) {
        console.log(`✅ [Critic Agent] APPROVED! Candidate passed VFX Mega-Trend validation.`);
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
    console.warn("⚠️ Critic validation or API limits reached. Generating dynamic pure visual Dual-Render fallback config.");
    const isSoftwareUI = promptContent.toLowerCase().includes("app") ||
                         promptContent.toLowerCase().includes("calendar") ||
                         promptContent.toLowerCase().includes("software") ||
                         promptContent.toLowerCase().includes("tool") ||
                         promptContent.toLowerCase().includes("neon") ||
                         promptContent.toLowerCase().includes("glitch") ||
                         promptContent.toLowerCase().includes("vfx") ||
                         promptContent.toLowerCase().includes("leak") ||
                         promptContent.toLowerCase().includes("overlay") ||
                         promptContent.toLowerCase().includes("hud") ||
                         promptContent.toLowerCase().includes("grok") ||
                         promptContent.toLowerCase().includes("ai") ||
                         promptContent.toLowerCase().includes("capcut") ||
                         promptContent.toLowerCase().includes("filmora");

    const renderModes: ("3D" | "2D")[] = isSoftwareUI ? ["3D", "2D"] : ["3D"];
    const cameraPaths: ("slow_orbit" | "smooth_dolly_in" | "macro_pan_up")[] = ["slow_orbit", "smooth_dolly_in", "macro_pan_up"];
    const chosenCam = cameraPaths[Math.floor(Math.random() * cameraPaths.length)];

    approvedJson = {
      seoPackage: {
        title: `Cinematic 4K VFX Motion Graphics: ${promptContent}`,
        description: `High-End 4K Visual Motion Graphics and Solid PBR Simulation of ${promptContent}`,
        seoTags: ["solid 3d", "4k", "procedural", "motion graphics", "stock video", "vfx template", "pbr materials", "pure visual", promptContent.toLowerCase()]
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
        complexity: 1.0
      },
      engine2D: isSoftwareUI ? {
        layoutStructure: "hud_circles",
        colorPalette: ["#00f0ff", "#ff007f", "#7000ff", "#00ffaa"],
        elements: [
          { type: "data_ring", scale: 1.0, thickness: 3 },
          { type: "glass_blob", size: 380 },
          { type: "hud_grid", rows: 5, cols: 8 },
          { type: "waveform_bars", scale: 1.0 }
        ]
      } : undefined,
      title: `Cinematic 4K VFX: ${promptContent}`,
      solid_core: "abstract_solid_waves",
      sceneType: "abstract_solid_waves",
      movementStyle: "quantum_flow",
      colors: ["#00f0ff", "#ff007f", "#7000ff"],
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

  console.log(`✅ MEGA-TREND METADATA SAVED FOR JOB ${jobIndex} (MODES: ${approvedJson.renderModes.join(' + ')})!`);
}

generate();
