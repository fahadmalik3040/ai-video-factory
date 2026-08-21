import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const main = async (): Promise<void> => {
  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";
  const outputDirectory = path.resolve(projectRoot, "out");

  // Locate dynamic job metadata
  const jobMetadataPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");

  let activeDataPath = sceneDataPath;
  if (fs.existsSync(jobMetadataPath)) {
    activeDataPath = jobMetadataPath;
  }

  if (!fs.existsSync(activeDataPath)) {
    throw new Error(`Scene data not found: ${activeDataPath}`);
  }

  console.log(`🎬 Reading dynamic scene data from: ${activeDataPath}`);
  const rawData = fs.readFileSync(activeDataPath, "utf8");
  const parsedJson = JSON.parse(rawData);

  // Build explicit dynamic props object ensuring engine2D and engine3D are top-level
  const dynamicProps = {
    ...parsedJson,
    engine2D: parsedJson.engine2D,
    engine3D: parsedJson.engine3D,
    seoPackage: parsedJson.seoPackage,
    colors: parsedJson.colors || parsedJson.engine3D?.colors || parsedJson.engine2D?.colorPalette,
    sceneData: parsedJson,
  };

  const renderModes: string[] = Array.isArray(parsedJson.renderModes)
    ? parsedJson.renderModes
    : ["3D", "2D"];

  if (!renderModes.includes("3D")) renderModes.unshift("3D");
  if (!renderModes.includes("2D")) renderModes.push("2D");

  console.log(`🎯 DUAL-RENDER ORCHESTRATOR DETECTED MODES FOR JOB ${jobIndex}: [${renderModes.join(", ")}]`);

  // Clear Remotion & Webpack bundler caches
  console.log("🧹 Clearing Remotion & Webpack bundler caches to guarantee dynamic data injection...");
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
  // PASS 1: Mandatory 3D Procedural Video Rendering
  // -----------------------------------------------------------
  if (renderModes.includes("3D")) {
    console.log(`\n🚀 [PASS 1/2] Resolving and Rendering Dynamic 3D Scene (Main3D)...`);
    const comp3D = await selectComposition({
      serveUrl: bundleLocation,
      id: "Main3D",
      inputProps: dynamicProps,
    });

    const output3DLocation = path.resolve(outputDirectory, `output_${jobIndex}_3d.mp4`);
    console.log(`🎥 Rendering 3D H.264 MP4 with dynamic props to: ${output3DLocation}`);

    await renderMedia({
      composition: comp3D,
      serveUrl: bundleLocation,
      outputLocation: output3DLocation,
      inputProps: dynamicProps,
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
  }

  // -----------------------------------------------------------
  // PASS 2: Mandatory 2D Motion Graphics UI/VFX Rendering
  // -----------------------------------------------------------
  if (renderModes.includes("2D")) {
    console.log(`\n🎨 [PASS 2/2] Resolving and Rendering Dynamic 2D Motion Graphics (Main2D)...`);
    const comp2D = await selectComposition({
      serveUrl: bundleLocation,
      id: "Main2D",
      inputProps: dynamicProps,
    });

    const output2DLocation = path.resolve(outputDirectory, `output_${jobIndex}_2d.mp4`);
    console.log(`🎥 Rendering 2D H.264 MP4 with dynamic props to: ${output2DLocation}`);

    await renderMedia({
      composition: comp2D,
      serveUrl: bundleLocation,
      outputLocation: output2DLocation,
      inputProps: dynamicProps,
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
  }

  console.log(`\n🎉 ALL DUAL-RENDER PASSES COMPLETED SUCCESSFULLY FOR JOB ${jobIndex}!`);
};

main().catch((error: unknown) => {
  console.error("❌ Dual-Render local execution failed:", error);
  process.exitCode = 1;
});
