import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

const run = async () => {
  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const cacheDir = path.resolve(process.cwd(), "node_modules/.cache");
  if (fs.existsSync(cacheDir)) fs.removeSync(cacheDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  const jsonData = fs.readJsonSync(jsonPath);

  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });
  const comps = await getCompositions(bundled, { inputProps: { data: jsonData } });

  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D');
  
  if (comp3D && jsonData.job3D) {
    console.log(`🎯 RENDERING FINANCIAL MASTERPIECE (Cloud Optimized H.264)...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "h264",
      crf: 16, // Visually Lossless Quality (God-Tier for Stock)
      outputLocation: path.join(outDir, "final_finance_premium.mp4"),
      inputProps: { data: jsonData.job3D },
      chromiumOptions: { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    });
    console.log(`✅ Render Complete! Cloud rendering successful.`);
  }
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
