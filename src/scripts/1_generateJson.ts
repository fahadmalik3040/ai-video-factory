import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import {puter} from "@heyputer/puter.js";
import {SceneSchema} from "../config/ZodSchema.ts";

type PromptRow = {
  prompt: string;
  tags?: string;
};

const projectRoot = process.cwd();
const promptsPath = path.join(projectRoot, "data", "prompts.csv");
const outputPath = path.join(projectRoot, "data", "sceneData.json");
const maxAttempts = 3;

const sceneStructure = `{
  "theme": "science | cyber | finance",
  "durationInFrames": "positive integer up to 36000",
  "fps": "integer from 1 to 120",
  "camera": { "type": "orbit | pan | push-in", "speed": "positive number", "distance": "positive number", "fov": "number from 10 to 120" },
  "lighting": { "keyIntensity": "number from 0 to 100", "fillIntensity": "number from 0 to 100", "rimIntensity": "number from 0 to 100", "colorTheme": "#RRGGBB" },
  "particles": { "count": "integer from 0 to 100000", "speed": "number from 0 to 100", "color": "#RRGGBB", "shape": "circle | square | star | sphere | spark" },
  "audio": { "bgmStyle": "string", "sfxTypes": ["string"] },
  "seed": "non-negative integer",
  "modelQuery": "string"
}`;

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

const extractText = (response: unknown): string => {
  const content = (response as {message?: {content?: unknown}}).message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part) => String(part)).join("");
  }

  throw new Error("Puter returned a response without text content.");
};

const stripMarkdownFence = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const generateSceneData = async () => {
  console.log("Reading the first prompt from data/prompts.csv...");
  const promptRow = await readFirstPrompt();
  const systemInstruction =
    "You are a strict JSON generator. Output ONLY raw JSON matching this structure. No markdown formatting, no backticks, no conversational text.";
  const fullPrompt = `${systemInstruction}\n\nRequired structure:\n${sceneStructure}\n\nCreate one high-quality procedural 3D video scene for this prompt:\n${promptRow.prompt}\n\nTags: ${promptRow.tags ?? "none"}`;

  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      const model = attempt === maxAttempts ? "deepseek/deepseek-v4-pro" : "openai/gpt-5.5";
      console.log(`Generating scene JSON (attempt ${attempt}/${maxAttempts}) with ${model}...`);

      const response = await puter.ai.chat(fullPrompt, {model});
      const rawText = stripMarkdownFence(extractText(response));
      const sceneData = SceneSchema.parse(JSON.parse(rawText));

      fs.writeFileSync(outputPath, JSON.stringify(sceneData, null, 2), "utf8");
      console.log(`Validated scene data saved to ${outputPath}`);
      break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxAttempts) {
        throw new Error("Unable to generate valid scene JSON after 3 attempts.");
      }

      console.log("Waiting 3 seconds before retrying...");
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      attempt += 1;
    }
  }
};

generateSceneData().catch((error: unknown) => {
  console.error("Scene JSON generation failed:", error);
  process.exitCode = 1;
});
