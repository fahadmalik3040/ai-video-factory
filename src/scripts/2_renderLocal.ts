import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

async function optimizedRender(): Promise<void> {
  console.log("🧹 PURGING ALL REMOTION & WEBPACK CACHES TO PREVENT STALE OUTPUT...");
  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";

  // Purge Remotion Cache
  const cacheDir = path.resolve("./node_modules/.cache/remotion");
  if (fs.existsSync(cacheDir)) {
    try {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log(`   Deleted cache: ${cacheDir}`);
    } catch {
      // Ignore error
    }
  }

  const additionalCaches = [
    path.resolve(projectRoot, ".remotion"),
    path.resolve(projectRoot, "node_modules/.cache/webpack"),
  ];

  for (const dir of additionalCaches) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   Deleted cache: ${dir}`);
      } catch {
        // Ignore warning
      }
    }
  }

  // Load fresh dynamic job metadata
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");
  const metaJobPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  const meta3DPath = path.resolve(projectRoot, "data", `metadata_3d_${jobIndex}.json`);

  let rawData = "{}";
  if (fs.existsSync(sceneDataPath)) {
    rawData = fs.readFileSync(sceneDataPath, "utf8");
  } else if (fs.existsSync(metaJobPath)) {
    rawData = fs.readFileSync(metaJobPath, "utf8");
  } else if (fs.existsSync(meta3DPath)) {
    rawData = fs.readFileSync(meta3DPath, "utf8");
  }

  const parsedData = JSON.parse(rawData);
  const dynamicProps = { ...parsedData, sceneData: parsedData };

  console.log(`🎯 TARGET CONCEPT FOR JOB ${jobIndex}: "${parsedData.clipCategory || parsedData.prompt || "Universal Stock Visual"}"`);
  console.log("📦 Fresh Bundling Remotion project with latest JSON data...");

  const bundled = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
    webpackOverride: (config) => ({
      ...config,
      cache: false,
    }),
  });

  const comps = await getCompositions(bundled, { inputProps: dynamicProps });
  const videoComp = comps.find((c) => c.id === "MainVideo" || c.id === "Main3D" || c.id === "MyComp") || comps[0];

  if (!videoComp) {
    throw new Error("❌ Composition not found!");
  }

  const outDir = path.resolve(projectRoot, "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const timestamp = Date.now();
  const outputLocation = path.join(outDir, `video_${timestamp}.mp4`);
  const output3DLocation = path.join(outDir, `output_${jobIndex}_3d.mp4`);
  const output2DLocation = path.join(outDir, `output_${jobIndex}_2d.mp4`);
  const finalVideoLocation = path.join(outDir, "final_video.mp4");
  const universalOutput = path.join(outDir, "output.mp4");

  console.log(`🎥 Rendering 4K Stock Video with 40M Bitrate Cap & SwiftShader (Safe CI, Small File Size)...`);
  await renderMedia({
    composition: videoComp,
    serveUrl: bundled,
    codec: "h264",
    outputLocation,
    inputProps: dynamicProps,
    videoBitrate: "40M", // STRICT 40 Mbps limit. CRF IS REMOVED.
    pixelFormat: "yuv420p",
    concurrency: 1,
    timeoutInMilliseconds: 600000,
    chromiumOptions: {
      gl: "swiftshader",
      disableWebSecurity: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-software-rasterizer", "--use-gl=swiftshader"]
    }
  });

  // Duplicate for universal compatibility and pipeline scripts
  try {
    fs.copyFileSync(outputLocation, output3DLocation);
    fs.copyFileSync(outputLocation, output2DLocation);
    fs.copyFileSync(outputLocation, finalVideoLocation);
    fs.copyFileSync(outputLocation, universalOutput);
  } catch {
    // Ignore copy error
  }

  console.log("✅ SUCCESS! Fresh optimized video generated at:", outputLocation);
}

optimizedRender().catch((err) => {
  console.error("❌ Fatal Render Error:", err);
  process.exit(1);
});
