import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

const run = async () => {
  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn("⚠️ No videoConfig.json found! Generating a safe fallback.");
    fs.ensureDirSync(path.dirname(jsonPath));
    fs.writeJsonSync(jsonPath, { job2D: { colorTheme: "#ff0055" }, job3D: { colorTheme: "#00ffcc" } });
  }
  const jsonData = fs.readJsonSync(jsonPath);

  console.log("📦 Bundling Remotion project for 4K UNCOMPRESSED PRORES ON CLOUD MAC...");
  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });
  const comps = await getCompositions(bundled, { inputProps: { data: jsonData } });

  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D');
  const comp2D = comps.find(c => c.id.toLowerCase().includes('2d') || c.id === 'Main2D');
  
  if (comp3D) {
    console.log(`🎯 RENDERING 3D MASTERPIECE ON GITHUB APPLE SILICON...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "prores",
      proresProfile: "4444",
      outputLocation: path.join(outDir, "final_3d_premium.mov"),
      inputProps: { data: jsonData.job3D || jsonData, renderType: "3d" }
    });
  }

  if (comp2D) {
    console.log(`🎯 RENDERING 2D MASTERPIECE ON GITHUB APPLE SILICON...`);
    await renderMedia({
      composition: comp2D,
      serveUrl: bundled,
      codec: "prores",
      proresProfile: "4444",
      outputLocation: path.join(outDir, "final_2d_premium.mov"),
      inputProps: { data: jsonData.job2D || jsonData, renderType: "2d" }
    });
  }
  console.log(`✅ Cloud Render Complete!`);
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
