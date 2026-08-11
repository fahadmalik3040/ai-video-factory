import fs from "node:fs";
import path from "node:path";
import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";

const main = async (): Promise<void> => {
  const projectRoot = process.cwd();
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");
  const outputDirectory = path.resolve(projectRoot, "out");

  if (!fs.existsSync(sceneDataPath)) {
    throw new Error(`Scene data not found: ${sceneDataPath}`);
  }

  console.log("Reading scene data...");
  const parsedJson = JSON.parse(fs.readFileSync(sceneDataPath, "utf8"));

  console.log("Bundling the Remotion project for local rendering...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
  });

  console.log("Resolving the MainVideo composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "MainVideo",
    inputProps: {sceneData: parsedJson},
  });

  fs.mkdirSync(outputDirectory, {recursive: true});
  const outputLocation = path.resolve(process.cwd(), "out", `video_${Date.now()}.mp4`);

  console.log("Rendering H.264 MP4 locally...");
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    outputLocation,
    inputProps: {sceneData: parsedJson},
    codec: "h264",
    crf: 16,
  });

  console.log(`Render completed successfully: ${outputLocation}`);
};

main().catch((error: unknown) => {
  console.error("Local render failed:", error);
  process.exitCode = 1;
});
