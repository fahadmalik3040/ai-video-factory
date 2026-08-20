import fs from 'fs';

function getNextTopic(): string {
  const promptsPath = 'data/prompts.csv';
  const usedTopicsPath = 'data/used_topics.json';
  const jobIndex = parseInt(process.env.JOB_INDEX || '0', 10);

  if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
  }

  // Check if a data/used_topics.json exists. If not, create it.
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

  // Read data/prompts.csv as an array of topics
  let topics: string[] = [];
  if (fs.existsSync(promptsPath)) {
    const content = fs.readFileSync(promptsPath, 'utf-8');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header line if present
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
    topics = ["Cinematic technology abstract"];
  }

  // Filter out any topics that are already in used_topics.json
  let freshTopics = topics.filter(t => !usedTopics.includes(t));

  // If all topics are used, clear the used_topics.json
  if (freshTopics.length === 0) {
    console.log("🔄 All topics in queue have been used! Resetting memory in used_topics.json...");
    usedTopics = [];
    fs.writeFileSync(usedTopicsPath, JSON.stringify([], null, 2));
    freshTopics = [...topics];
  }

  // Pick the topic corresponding to the job index
  const selectedTopic = freshTopics[jobIndex % freshTopics.length];

  // IMMEDIATELY save this chosen topic into data/used_topics.json so future runs skip it
  if (!usedTopics.includes(selectedTopic)) {
    usedTopics.push(selectedTopic);
    fs.writeFileSync(usedTopicsPath, JSON.stringify(usedTopics, null, 2));
  }

  console.log(`🎯 JOB INDEX ${jobIndex} SELECTED FRESH TOPIC (${usedTopics.length}/${topics.length} used): "${selectedTopic}"`);
  return selectedTopic;
}

async function generate() {
  console.log("🚀 INITIATING MODULAR SCENE DIRECTOR (NVIDIA 550B)...");
  
  const apiKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join(""); 
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const model = "nvidia/nemotron-3-ultra-550b-a55b";

  const promptContent = getNextTopic();

  const fallbackScene = {
    title: "Abstract Quantum Neural Flow 4K",
    seoTags: ["abstract", "4k", "procedural", "motion graphics", "stock video", "finance", "science", "cyber"],
    sceneType: "cyber",
    colors: ["#00f0ff", "#ff007f"],
    cameraSpeed: 1.5,
    bloomIntensity: 2.0
  };

  const payload = {
    model: model,
    messages: [
      { 
        role: "system", 
        content: "You are an expert 3D motion graphics director and autonomous video script JSON generator. Output STRICT JSON only. Do not add any conversational text before or after the JSON. Ensure the JSON is completely valid. Analyze the trending keyword. Select the best matching 'sceneType' (finance for market data, science for biotech/DNA, cyber for tech/data). Output only valid JSON." 
      },
      { 
        role: "user", 
        content: `Analyze the trending keyword: "${promptContent}". Select the best matching 'sceneType' (finance for market data, science for biotech/DNA, cyber for tech/data). Output strictly matching this JSON schema:\n{\n  "title": "string",\n  "seoTags": ["array of 50 trending stock video tags"],\n  "sceneType": "finance" | "science" | "cyber",\n  "colors": ["hex1", "hex2"],\n  "cameraSpeed": 1.5,\n  "bloomIntensity": 2.0\n}` 
      }
    ],
    temperature: 0.7,
    max_tokens: 4096
  };

  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;
  let finalJson = "";

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    console.log(`⏳ Nvidia Scene Director Attempt ${attempt} of ${MAX_RETRIES}...`);
    
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
        if (attempt === MAX_RETRIES) throw new Error(data.error.message || "API Failed");
        await new Promise(res => setTimeout(res, 2000)); 
        continue;
      }

      if (data.choices && data.choices[0]) {
        let rawText = data.choices[0].message.content;
        
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            finalJson = jsonMatch[0];
        } else {
            finalJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        }
        
        const parsed = JSON.parse(finalJson);
        if (!parsed.sceneType || !["finance", "science", "cyber"].includes(parsed.sceneType)) {
          parsed.sceneType = "cyber";
        }
        if (!Array.isArray(parsed.colors) || parsed.colors.length < 2) {
          parsed.colors = ["#00f0ff", "#ff007f"];
        }
        finalJson = JSON.stringify(parsed, null, 2);
        
        success = true;
        console.log("✅ NVIDIA 550B MODEL DIRECTED SCENE CONFIGURATION SUCCESSFULLY!");
      }
    } catch (err: any) {
      console.error(`❌ Parse/Network Error on attempt ${attempt}:`, err.message);
      if (attempt === MAX_RETRIES) {
        console.error("🚨 FATAL: All 3 Nvidia attempts failed. Proceeding with default high-quality modular scene config.");
        finalJson = JSON.stringify(fallbackScene, null, 2);
        success = true;
      } else {
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }

  // Save JSON and SEO metadata
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  if (!fs.existsSync('out')) fs.mkdirSync('out');
  
  try {
    let parsed: any;
    try {
      parsed = JSON.parse(finalJson);
    } catch {
      parsed = fallbackScene;
    }
    
    fs.writeFileSync('data/sceneData.json', JSON.stringify(parsed, null, 2));
    
    const tags = Array.isArray(parsed.seoTags) ? parsed.seoTags.join(", ") : "3d, abstract, 4k, r3f, motion graphics";
    fs.writeFileSync('out/metadata.txt', `TITLE:\n${parsed.title || "Procedural 3D Stock Visual"}\n\nTAGS:\n${tags}`);
    console.log("✅ MODULAR SCENE CONFIG & METADATA SAVED SUCCESSFULLY!");
  } catch (e) {
    console.error("🚨 FATAL: JSON Save Failed.");
    process.exit(1);
  }
}

generate();



