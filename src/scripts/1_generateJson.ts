import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { SceneSchema } from '../config/ZodSchema';

type PromptRow = {
  prompt: string;
  category?: string;
  colorTheme?: string;
  complexity?: string;
  motionStyle?: string;
};

const projectRoot = process.cwd();
const promptsPath = path.join(projectRoot, "data", "prompts.csv");
const outputPath = path.join(projectRoot, "data", "sceneData.json");
const metadataPath = path.join(projectRoot, "out", "metadata.txt");

const readFirstPrompt = (): Promise<PromptRow> =>
  new Promise((resolve, reject) => {
    let foundPrompt = false;
    if (!fs.existsSync(promptsPath)) {
      return resolve({ prompt: "Futuristic 3D cybernetic particle visual" });
    }
    fs.createReadStream(promptsPath)
      .pipe(csv())
      .on("data", (row: PromptRow) => {
        if (!foundPrompt) {
          foundPrompt = true;
          resolve(row);
        }
      })
      .on("end", () => {
        if (!foundPrompt) {
          resolve({ prompt: "Futuristic 3D cybernetic particle visual" });
        }
      })
      .on("error", reject);
  });

const stripMarkdownFence = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

async function generate() {
  console.log("🚀 INITIATING VIP GROQ ENGINE (Bypassing Proxies)...");
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const apiKey = "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"; 

  const promptRow = await readFirstPrompt();

  const sceneStructure = `{
    "title": "Highly clickable Shutterstock title string",
    "seoTags": ["array of up to 50 trending SEO stock video tag strings"],
    "theme": "science",
    "durationInFrames": 300,
    "fps": 30,
    "camera": {"type": "orbit", "speed": 2, "distance": 10, "fov": 60},
    "lighting": {"keyIntensity": 50, "fillIntensity": 30, "rimIntensity": 40, "colorTheme": "#ff00ff"},
    "particles": {"count": 5000, "speed": 10, "color": "#00ffff", "shape": "sphere"},
    "audio": {"bgmStyle": "ambient_cinematic", "sfxTypes": ["whoosh"]},
    "seed": 12345,
    "modelQuery": "3d hologram geometry"
  }`;

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are an autonomous JSON script generator. Output STRICT JSON only. Generate a highly clickable Shutterstock title and an array of exactly 50 trending SEO stock video tags. For particles.shape, choose strictly one of: circle, square, star, sphere, spark. For theme, choose strictly one of: science, cyber, finance. For camera.type, choose strictly one of: orbit, pan, push-in." },
      { role: "user", content: `Required structure:\n${sceneStructure}\n\nCreate a scene JSON for prompt: "${promptRow.prompt}". Category: ${promptRow.category || "technology"}. Color: ${promptRow.colorTheme || "#00ffff"}.` }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`GROQ API Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const jsonContent = stripMarkdownFence(data.choices[0].message.content);
    
    const parsed = JSON.parse(jsonContent);

    // Defensive normalization
    const validShapes = ["circle", "square", "star", "sphere", "spark"];
    if (parsed.particles && !validShapes.includes(parsed.particles.shape)) {
      parsed.particles.shape = "sphere";
    }
    const validThemes = ["science", "cyber", "finance"];
    if (!validThemes.includes(parsed.theme)) {
      parsed.theme = "science";
    }
    const validCameras = ["orbit", "pan", "push-in"];
    if (parsed.camera && !validCameras.includes(parsed.camera.type)) {
      parsed.camera.type = "orbit";
    }

    const sceneData = SceneSchema.parse(parsed);

    if (!fs.existsSync('data')) fs.mkdirSync('data');
    fs.writeFileSync(outputPath, JSON.stringify(sceneData, null, 2), 'utf8');
    console.log("✅ JSON generated successfully via Groq!");

    // Generate metadata.txt for Shutterstock upload
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    const metadataText = `Title: ${sceneData.title}\n\nTags:\n${sceneData.seoTags.join(", ")}\n`;
    fs.writeFileSync(metadataPath, metadataText, 'utf8');
    console.log(`✅ SEO Metadata written to ${metadataPath}!`);

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();
