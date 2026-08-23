import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const main = async (): Promise<void> => {
  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";
  const outputDirectory = path.resolve(projectRoot, "out");

  // Locate dynamic job metadata for 3D and 2D
  const meta3DPath = path.resolve(projectRoot, "data", `metadata_3d_${jobIndex}.json`);
  const meta2DPath = path.resolve(projectRoot, "data", `metadata_2d_${jobIndex}.json`);
  const fallbackPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");

  // Load 3D Scene Data
  let raw3D = "{}";
  if (fs.existsSync(meta3DPath)) {
    raw3D = fs.readFileSync(meta3DPath, "utf8");
  } else if (fs.existsSync(fallbackPath)) {
    raw3D = fs.readFileSync(fallbackPath, "utf8");
  } else if (fs.existsSync(sceneDataPath)) {
    raw3D = fs.readFileSync(sceneDataPath, "utf8");
  }
  const parsed3D = JSON.parse(raw3D);

  // Load 2D Scene Data
  let raw2D = "{}";
  if (fs.existsSync(meta2DPath)) {
    raw2D = fs.readFileSync(meta2DPath, "utf8");
  } else if (fs.existsSync(fallbackPath)) {
    raw2D = fs.readFileSync(fallbackPath, "utf8");
  } else if (fs.existsSync(sceneDataPath)) {
    raw2D = fs.readFileSync(sceneDataPath, "utf8");
  }
  const parsed2D = JSON.parse(raw2D);

  const dynamicProps3D = {
    ...parsed3D,
    sceneData: parsed3D,
  };

  const dynamicProps2D = {
    ...parsed2D,
    sceneData: parsed2D,
  };

  console.log(`\n======================================================`);
  console.log(`🎯 DUAL INDEPENDENT RENDER ORCHESTRATOR FOR JOB ${jobIndex}:`);
  console.log(`   3D Concept: ${parsed3D.commercialConcept || "Procedural GLSL Shader"}`);
  console.log(`   2D Overlay: ${parsed2D.engine2DOverlay?.overlayType || "Cinematic Light Leak"}`);
  console.log(`======================================================\n`);

  // Clear Remotion & Webpack bundler caches
  console.log("🧹 Clearing Remotion & Webpack bundler caches...");
  const cacheDirs = [
    path.resolve(projectRoot, ".remotion"),
    path.resolve(projectRoot, "node_modules", ".cache", "remotion"),
    path.resolve(projectRoot, "node_modules", ".cache", "webpack"),
  ];

  for (const dir of cacheDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup warnings
    }
  }

  console.log("📦 Bundling Remotion project with dynamic inputProps...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
    webpackOverride: (config) => ({
      ...config,
      cache: false,
    }),
  });

  fs.mkdirSync(outputDirectory, { recursive: true });

  const chromiumOptions = {
    enableGpu: true,
    gl: "angle" as const,
    disableWebSecurity: true,
    ignoreCertificateErrors: true,
  };

  // -----------------------------------------------------------
  // PASS 1: Dedicated 3D Procedural Video Rendering
  // -----------------------------------------------------------
  console.log(`\n🚀 [PASS 1/2] Resolving and Rendering Dedicated 3D Scene (Main3D)...`);
  const comp3D = await selectComposition({
    serveUrl: bundleLocation,
    id: "Main3D",
    inputProps: dynamicProps3D,
    timeoutInMilliseconds: 120000,
    chromiumOptions,
  });

  const output3DLocation = path.resolve(outputDirectory, `output_${jobIndex}_3d.mp4`);
  console.log(`🎥 Rendering 3D H.264 MP4 (CRF 21, yuv420p) to: ${output3DLocation}`);

  await renderMedia({
    composition: comp3D,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: output3DLocation,
    inputProps: dynamicProps3D,
    crf: 21,
    pixelFormat: "yuv420p",
    proResProfile: undefined,
    timeoutInMilliseconds: 120000,
    chromiumOptions,
  });
  console.log(`✅ [3D COMPLETE] Dedicated 3D Video Rendered: ${output3DLocation}`);

  // -----------------------------------------------------------
  // PASS 2: Dedicated 2D Motion Graphics Video Rendering
  // -----------------------------------------------------------
  console.log(`\n🚀 [PASS 2/2] Resolving and Rendering Dedicated 2D Motion Graphics (Main2D)...`);
  const comp2D = await selectComposition({
    serveUrl: bundleLocation,
    id: "Main2D",
    inputProps: dynamicProps2D,
    timeoutInMilliseconds: 120000,
    chromiumOptions,
  });

  const output2DLocation = path.resolve(outputDirectory, `output_${jobIndex}_2d.mp4`);
  console.log(`🎥 Rendering 2D H.264 MP4 (CRF 21, yuv420p) to: ${output2DLocation}`);

  await renderMedia({
    composition: comp2D,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: output2DLocation,
    inputProps: dynamicProps2D,
    crf: 21,
    pixelFormat: "yuv420p",
    proResProfile: undefined,
    timeoutInMilliseconds: 120000,
    chromiumOptions,
  });
  console.log(`✅ [2D COMPLETE] Dedicated 2D Video Rendered: ${output2DLocation}`);

  // Also create universal output.mp4 copy for CI artifacts
  const universalOutput = path.resolve(outputDirectory, "output.mp4");
  try {
    fs.copyFileSync(output3DLocation, universalOutput);
  } catch {
    // Ignore copy error
  }

  console.log(`\n🎉 [ALL RENDERS COMPLETE FOR JOB ${jobIndex}]`);
  console.log(`   3D: ${output3DLocation}`);
  console.log(`   2D: ${output2DLocation}`);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal Error in Local Render Orchestrator:", err);
    process.exit(1);
  });
