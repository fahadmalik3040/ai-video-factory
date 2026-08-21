import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const main = async (): Promise<void> => {
  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";
  const outputDirectory = path.resolve(projectRoot, "out");

  // Locate scene metadata
  const jobMetadataPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");

  let activeDataPath = sceneDataPath;
  if (fs.existsSync(jobMetadataPath)) {
    activeDataPath = jobMetadataPath;
  }

  if (!fs.existsSync(activeDataPath)) {
    throw new Error(`Scene data not found: ${activeDataPath}`);
  }

  console.log(`🎬 Reading scene data from: ${activeDataPath}`);
  const parsedJson = JSON.parse(fs.readFileSync(activeDataPath, "utf8"));

  const renderModes: string[] = Array.isArray(parsedJson.renderModes)
    ? parsedJson.renderModes
    : ["3D"];

  // Ensure 3D is always present
  if (!renderModes.includes("3D")) {
    renderModes.unshift("3D");
  }

  console.log(`🎯 DUAL-RENDER ORCHESTRATOR DETECTED MODES FOR JOB ${jobIndex}: [${renderModes.join(", ")}]`);

  console.log("📦 Bundling Remotion project for multi-composition rendering...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
  });

  fs.mkdirSync(outputDirectory, { recursive: true });

  // -----------------------------------------------------------
  // PASS 1: Mandatory 3D Procedural Video Rendering
  // -----------------------------------------------------------
  if (renderModes.includes("3D")) {
    console.log(`\n🚀 [PASS 1/2] Resolving and Rendering Mandatory 3D Scene (Main3D)...`);
    const comp3D = await selectComposition({
      serveUrl: bundleLocation,
      id: "Main3D",
      inputProps: { sceneData: parsedJson },
    });

    const output3DLocation = path.resolve(outputDirectory, `output_${jobIndex}_3d.mp4`);
    console.log(`🎥 Rendering 3D H.264 MP4 to: ${output3DLocation}`);

    await renderMedia({
      composition: comp3D,
      serveUrl: bundleLocation,
      outputLocation: output3DLocation,
      inputProps: { sceneData: parsedJson },
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
  // PASS 2: Optional 2D Motion Graphics UI/Software Rendering
  // -----------------------------------------------------------
  if (renderModes.includes("2D")) {
    console.log(`\n🎨 [PASS 2/2] Resolving and Rendering Secondary 2D Motion Graphics (Main2D)...`);
    const comp2D = await selectComposition({
      serveUrl: bundleLocation,
      id: "Main2D",
      inputProps: { sceneData: parsedJson },
    });

    const output2DLocation = path.resolve(outputDirectory, `output_${jobIndex}_2d.mp4`);
    console.log(`🎥 Rendering 2D H.264 MP4 to: ${output2DLocation}`);

    await renderMedia({
      composition: comp2D,
      serveUrl: bundleLocation,
      outputLocation: output2DLocation,
      inputProps: { sceneData: parsedJson },
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
