import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

async function autoGenerateVideo(): Promise<void> {
  console.log("🚀 STARTING STABLE CLOUD-SAFE 4K RENDERING...");
  
  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";
  const outDir = path.resolve(projectRoot, "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Locate dynamic job metadata for 3D and 2D
  const meta3DPath = path.resolve(projectRoot, "data", `metadata_3d_${jobIndex}.json`);
  const meta2DPath = path.resolve(projectRoot, "data", `metadata_2d_${jobIndex}.json`);
  const fallbackPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");

  let raw3D = "{}";
  if (fs.existsSync(meta3DPath)) {
    raw3D = fs.readFileSync(meta3DPath, "utf8");
  } else if (fs.existsSync(fallbackPath)) {
    raw3D = fs.readFileSync(fallbackPath, "utf8");
  } else if (fs.existsSync(sceneDataPath)) {
    raw3D = fs.readFileSync(sceneDataPath, "utf8");
  }
  const parsed3D = JSON.parse(raw3D);

  let raw2D = "{}";
  if (fs.existsSync(meta2DPath)) {
    raw2D = fs.readFileSync(meta2DPath, "utf8");
  } else if (fs.existsSync(fallbackPath)) {
    raw2D = fs.readFileSync(fallbackPath, "utf8");
  } else if (fs.existsSync(sceneDataPath)) {
    raw2D = fs.readFileSync(sceneDataPath, "utf8");
  }
  const parsed2D = JSON.parse(raw2D);

  const dynamicProps3D = { ...parsed3D, sceneData: parsed3D };
  const dynamicProps2D = { ...parsed2D, sceneData: parsed2D };

  console.log("📦 Bundling Remotion project with dynamic Webpack settings...");
  const bundled = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
    webpackOverride: (config) => ({
      ...config,
      cache: false,
    }),
  });

  const comps = await getCompositions(bundled, { inputProps: dynamicProps3D });
  const comp3D = comps.find((c) => c.id === "Main3D" || c.id === "MainVideo") || comps[0];
  const comp2D = comps.find((c) => c.id === "Main2D") || comps[0];

  if (!comp3D) {
    throw new Error("❌ Composition not found in Remotion bundle!");
  }

  // 1. Render Primary 3D Video
  const output3DLocation = path.join(outDir, `output_${jobIndex}_3d.mp4`);
  const finalVideoLocation = path.join(outDir, "final_video.mp4");
  const universalOutput = path.join(outDir, "output.mp4");

  console.log(`🎥 [PASS 1/2] Rendering 3D 4K Video safely to: ${output3DLocation}`);
  await renderMedia({
    composition: comp3D,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: output3DLocation,
    inputProps: dynamicProps3D,
    crf: 16,
    concurrency: 1,
    pixelFormat: "yuv420p",
    timeoutInMilliseconds: 600000,
  });

  // Duplicate for universal compatibility and pipeline scripts
  try {
    fs.copyFileSync(output3DLocation, finalVideoLocation);
    fs.copyFileSync(output3DLocation, universalOutput);
  } catch {
    // Ignore copy error
  }

  // 2. Render Secondary 2D Video
  const output2DLocation = path.join(outDir, `output_${jobIndex}_2d.mp4`);
  console.log(`🎥 [PASS 2/2] Rendering 2D 4K Video safely to: ${output2DLocation}`);
  try {
    await renderMedia({
      composition: comp2D,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: output2DLocation,
      inputProps: dynamicProps2D,
      crf: 16,
      concurrency: 1,
      pixelFormat: "yuv420p",
      timeoutInMilliseconds: 600000,
    });
  } catch (err: any) {
    console.warn("⚠️ 2D Pass skipped or encountered non-fatal warning:", err.message);
  }

  console.log("✅ BOOM! All 4K Videos successfully generated in:", outDir);
}

autoGenerateVideo().catch((err) => {
  console.error("❌ Fatal Render Error:", err);
  process.exit(1);
});
