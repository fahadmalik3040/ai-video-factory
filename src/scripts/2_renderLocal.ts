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
    engine3D: parsed3D.engine3D,
    colors: parsed3D.colors || parsed3D.engine3D?.colors,
    sceneData: parsed3D,
  };

  const dynamicProps2D = {
    ...parsed2D,
    engine2D: parsed2D.engine2D,
    colors: parsed2D.colors || parsed2D.engine2D?.colorPalette,
    sceneData: parsed2D,
  };

  console.log(`🎯 DUAL INDEPENDENT RENDER ORCHESTRATOR FOR JOB ${jobIndex}:`);
  console.log(`   3D Target: ${parsed3D.engine3D?.solidGeometry} (${parsed3D.engine3D?.layoutMath})`);
  console.log(`   2D Archetype: ${parsed2D.engine2D?.layoutStructure}`);

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

  // -----------------------------------------------------------
  // PASS 1: Dedicated 3D Procedural Video Rendering
  // -----------------------------------------------------------
  console.log(`\n🚀 [PASS 1/2] Resolving and Rendering Dedicated 3D Scene (Main3D)...`);
  const comp3D = await selectComposition({
    serveUrl: bundleLocation,
    id: "Main3D",
    inputProps: dynamicProps3D,
  });

  const output3DLocation = path.resolve(outputDirectory, `output_${jobIndex}_3d.mp4`);
  console.log(`🎥 Rendering 3D H.264 MP4 to: ${output3DLocation}`);

  await renderMedia({
    composition: comp3D,
    serveUrl: bundleLocation,
    outputLocation: output3DLocation,
    inputProps: dynamicProps3D,
    codec: "h264",
    crf: 16,
    concurrency: 1,
    timeoutInMilliseconds: 300000,
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true,
      gl: "angle",
      args: ["--use-gl=angle", "--enable-webgl", "--disable-software-rasterizer"],
    } as any,
  });

  console.log(`✅ [PASS 1 COMPLETE] 3D Video successfully rendered: ${output3DLocation}`);

  // -----------------------------------------------------------
  // PASS 2: Dedicated 2D Motion Graphics UI/VFX Rendering
  // -----------------------------------------------------------
  console.log(`\n🎨 [PASS 2/2] Resolving and Rendering Dedicated 2D Motion Graphics (Main2D)...`);
  const comp2D = await selectComposition({
    serveUrl: bundleLocation,
    id: "Main2D",
    inputProps: dynamicProps2D,
  });

  const output2DLocation = path.resolve(outputDirectory, `output_${jobIndex}_2d.mp4`);
  console.log(`🎥 Rendering 2D H.264 MP4 to: ${output2DLocation}`);

  await renderMedia({
    composition: comp2D,
    serveUrl: bundleLocation,
    outputLocation: output2DLocation,
    inputProps: dynamicProps2D,
    codec: "h264",
    crf: 16,
    concurrency: 1,
    timeoutInMilliseconds: 300000,
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true,
      gl: "angle",
      args: ["--use-gl=angle", "--enable-webgl", "--disable-software-rasterizer"],
    } as any,
  });

  console.log(`✅ [PASS 2 COMPLETE] 2D Video successfully rendered: ${output2DLocation}`);
  console.log(`\n🎉 BOTH DEDICATED 3D & 2D RENDERS COMPLETED SUCCESSFULLY FOR JOB ${jobIndex}!`);
};

main().catch((error: unknown) => {
  console.error("❌ Dedicated dual-render execution failed:", error);
  process.exitCode = 1;
});
