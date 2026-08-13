import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import OpenAI from "openai";
import "dotenv/config";
import {SceneSchema} from "../config/ZodSchema.ts";

type PromptRow = {
  prompt: string;
  tags?: string;
};

const projectRoot = process.cwd();
const promptsPath = path.join(projectRoot, "data", "prompts.csv");
const outputPath = path.join(projectRoot, "data", "sceneData.json");

const sceneStructure = `{
  "theme": "science | cyber | finance",
  "durationInFrames": "positive integer up to 36000",
  "fps": "integer from 1 to 120",
  "camera": {"type": "orbit | pan | push-in", "speed": "positive number", "distance": "positive number", "fov": "number from 10 to 120"},
  "lighting": {"keyIntensity": "number from 0 to 100", "fillIntensity": "number from 0 to 100", "rimIntensity": "number from 0 to 100", "colorTheme": "#RRGGBB"},
  "particles": {"count": "integer from 0 to 100000", "speed": "number from 0 to 100", "color": "#RRGGBB", "shape": "circle | square | star | sphere | spark"},
  "audio": {"bgmStyle": "string", "sfxTypes": ["string"]},
  "seed": "non-negative integer",
  "modelQuery": "string"
}`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.hcnsec.cn/v1",
});

const readFirstPrompt = (): Promise<PromptRow> =>
  new Promise((resolve, reject) => {
    let foundPrompt = false;

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
          reject(new Error("No prompt rows were found in data/prompts.csv."));
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

const main = async (): Promise<void> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required. Configure it in .env or GitHub Actions secrets.");
  }

  const models = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

  console.log("Reading the first prompt from data/prompts.csv...");
  const promptRow = await readFirstPrompt();
  const prompt = `You are a strict JSON generator. Output ONLY raw JSON matching this structure. No markdown, backticks, or conversational text.\n\nRequired structure:\n${sceneStructure}\n\nCreate one coherent procedural 3D video scene for:\n${promptRow.prompt}\n\nTags: ${promptRow.tags ?? "none"}`;

  for (const model of models) {
    try {
      console.log(`Requesting scene JSON from proxy using model ${model}...`);
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [{role: "user", content: prompt}],
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("The proxy returned no completion content.");
      }

      const sceneData = SceneSchema.parse(JSON.parse(stripMarkdownFence(content)));
      fs.writeFileSync(outputPath, JSON.stringify(sceneData, null, 2), "utf8");
      console.log(`Validated scene data saved to ${outputPath}`);
      return;
    } catch {
      console.log(`Model ${model} failed, trying next...`);
    }
  }

  throw new Error("All models failed to generate valid scene JSON.");
};

main().catch((error: unknown) => {
  console.error("Scene JSON generation failed:", error);
  process.exitCode = 1;
});
