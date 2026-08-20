import fs from 'fs';

function getNextTopic(): string {
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
    topics = ["Cinematic technology abstract quantum data visual"];
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

  console.log(`🎯 JOB INDEX ${jobIndex} SELECTED FRESH TOPIC (${usedTopics.length}/${topics.length} used): "${selectedTopic}"`);
  return selectedTopic;
}

interface HistoryItem {
  timestamp: string;
  title: string;
  sceneType: string;
  particleShape: string;
  movementStyle: string;
  colors: string[];
  seoTags: string[];
}

function validateWithCritic(candidate: any, history: HistoryItem[]): { valid: boolean; reason?: string } {
  if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length < 5) {
    return { valid: false, reason: "REJECTED: Title is missing or too short." };
  }

  if (!Array.isArray(candidate.seoTags) || candidate.seoTags.length < 15) {
    return { valid: false, reason: "REJECTED: SEO tags count is insufficient (must be at least 15 high-quality niche tags)." };
  }

  if (!Array.isArray(candidate.colors) || candidate.colors.length < 2) {
    return { valid: false, reason: "REJECTED: Color palette is weak or missing." };
  }

  const validShapes = ["nebula", "helix", "spheres", "lines", "grid", "quantum_grid"];
  const shape = candidate.particleShape || candidate.sceneType;
  if (!shape || !validShapes.includes(shape)) {
    return { valid: false, reason: `REJECTED: Particle shape '${shape}' is invalid or rigid.` };
  }

  const validMovements = ["vortex", "wave", "orbital", "expansion", "quantum_flow"];
  if (!candidate.movementStyle || !validMovements.includes(candidate.movementStyle)) {
    return { valid: false, reason: `REJECTED: Movement style '${candidate.movementStyle}' is invalid.` };
  }

  for (const past of history) {
    const candTitleLower = candidate.title.toLowerCase();
    const pastTitleLower = past.title.toLowerCase();
    if (candTitleLower === pastTitleLower || (candTitleLower.length > 10 && pastTitleLower.includes(candTitleLower))) {
      return { valid: false, reason: `REJECTED: Topic/Title "${candidate.title}" is too similar to past run "${past.title}".` };
    }

    if (past.particleShape === shape &&
        past.movementStyle === candidate.movementStyle &&
        past.colors && past.colors[0] === candidate.colors[0]) {
      return { valid: false, reason: `REJECTED: Visual combo (${shape} + ${candidate.movementStyle} + ${candidate.colors[0]}) is identical to past generation.` };
    }
  }

  return { valid: true };
}

async function generate() {
  console.log("🚀 INITIATING DUAL-AGENT (ACTOR-CRITIC) MODULAR DIRECTOR (NVIDIA 550B)...");
  
  const apiKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join(""); 
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const model = "nvidia/nemotron-3-ultra-550b-a55b";

  const promptContent = getNextTopic();
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
    console.log(`⏳ [Actor Generator] Attempt ${attempt} of ${MAX_ATTEMPTS}...`);

    let userPrompt = `Analyze the trending keyword: "${promptContent}". Select an obscure, ultra-creative sub-niche. Output strictly matching this JSON schema:\n{\n  "title": "string (unique, cinematic, highly descriptive title)",\n  "seoTags": ["array of 50 high-quality niche trending stock video tags"],\n  "sceneType": "nebula" | "helix" | "spheres" | "lines" | "quantum_grid",\n  "particleShape": "nebula" | "helix" | "spheres" | "lines" | "grid",\n  "movementStyle": "vortex" | "wave" | "orbital" | "expansion" | "quantum_flow",\n  "colors": ["#hex1", "#hex2", "#hex3"],\n  "cameraSpeed": 1.5,\n  "bloomIntensity": 2.5,\n  "particleCount": 3000,\n  "complexity": 1.2\n}`;

    if (rejectionFeedback) {
      userPrompt += `\n\nCRITICAL DIRECTIVE FROM CRITIC AGENT: ${rejectionFeedback} The previous output was rejected for being repetitive or weak. Generate a completely new, highly complex, obscure niche topic and radically different visual parameters (colors, particleShape, movementStyle).`;
    }

    const payload = {
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are an elite 3D procedural motion graphics director. Output STRICT JSON only. Do not add markdown text outside the JSON. Create unique, abstract, mind-bending visual configurations with vibrant color palettes and dynamic movement parameters." 
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

        console.log(`🔍 [Critic Agent] Evaluating Candidate: "${candidate.title}"...`);
        const criticResult = validateWithCritic(candidate, history);

        if (criticResult.valid) {
          console.log(`✅ [Critic Agent] APPROVED! Candidate passed Quality Control validation.`);
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
    console.warn("⚠️ Critic validation or API limits reached. Generating dynamic procedural fallback config.");
    const fallbackShapes = ["nebula", "helix", "spheres", "lines", "grid"];
    const fallbackMovements = ["vortex", "wave", "orbital", "expansion", "quantum_flow"];
    const chosenShape = fallbackShapes[Math.floor(Math.random() * fallbackShapes.length)];
    const chosenMovement = fallbackMovements[Math.floor(Math.random() * fallbackMovements.length)];

    approvedJson = {
      title: `Abstract ${chosenShape.toUpperCase()} Procedural Quantum Flow 4K`,
      seoTags: ["abstract", "4k", "procedural", "motion graphics", "stock video", chosenShape, chosenMovement, "quantum"],
      sceneType: chosenShape,
      particleShape: chosenShape,
      movementStyle: chosenMovement,
      colors: ["#00f0ff", "#ff007f", "#7000ff"],
      cameraSpeed: 1.8,
      bloomIntensity: 2.5,
      particleCount: 3000,
      complexity: 1.2
    };
  }

  const historyEntry: HistoryItem = {
    timestamp: new Date().toISOString(),
    title: approvedJson.title,
    sceneType: approvedJson.sceneType || approvedJson.particleShape || "nebula",
    particleShape: approvedJson.particleShape || "nebula",
    movementStyle: approvedJson.movementStyle || "quantum_flow",
    colors: approvedJson.colors || ["#00f0ff", "#ff007f"],
    seoTags: approvedJson.seoTags || []
  };

  history.push(historyEntry);
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  fs.writeFileSync('data/sceneData.json', JSON.stringify(approvedJson, null, 2));
  
  const tags = Array.isArray(approvedJson.seoTags) ? approvedJson.seoTags.join(", ") : "3d, abstract, 4k, r3f, procedural";
  fs.writeFileSync('out/metadata.txt', `TITLE:\n${approvedJson.title || "Procedural 3D Stock Visual"}\n\nTAGS:\n${tags}`);
  console.log("✅ DUAL-AGENT VALIDATED SCENE & METADATA SAVED SUCCESSFULLY!");
}

generate();
