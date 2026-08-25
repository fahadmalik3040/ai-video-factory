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
  const fallbackPath = path.resolve("data/sceneData.json");

  let jsonData: any = {
    job3D: { trendTopic: "WALL STREET INDEX", clipCategory: "candlestick_growth", colorTheme: "#00ffcc" },
    job2D: { trendTopic: "CYBER ECONOMY", clipCategory: "holographic_data", colorTheme: "#ff0055" }
  };

  if (fs.existsSync(jsonPath)) {
    try {
      jsonData = fs.readJsonSync(jsonPath);
    } catch {}
  } else if (fs.existsSync(fallbackPath)) {
    try {
      jsonData = fs.readJsonSync(fallbackPath);
    } catch {}
  }

  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });
  const comps = await getCompositions(bundled, { inputProps: { data: jsonData } });

  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D' || c.id === 'MainVideo') || comps[0];
  
  if (comp3D && jsonData.job3D) {
    console.log(`🎯 RENDERING FINANCIAL MASTERPIECE...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "prores",
      proresProfile: "4444",
      outputLocation: path.join(outDir, "final_finance_premium.mov"),
      inputProps: { data: jsonData.job3D },
      chromiumOptions: { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    });
    console.log(`✅ Render Complete: ${path.join(outDir, "final_finance_premium.mov")}`);
  }
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
