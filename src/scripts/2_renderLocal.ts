import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

const run = async () => {
  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("videoConfig.json not found!");
  }
  const jsonData = fs.readJsonSync(jsonPath);

  console.log("📦 Bundling project for Heavyweight Adobe Stock 4K...");
  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });

  // Fixed Chromium flags for Headless WebGL / SwiftShader support
  const chromiumOptions = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-gpu-blocklist",
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader"
    ]
  };

  const comps = await getCompositions(bundled, { 
    inputProps: { data: jsonData },
    chromiumOptions 
  });

  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D') || comps[0];
  
  if (comp3D) {
    console.log(`🎯 RENDERING HEAVYWEIGHT 4K (Forcing 80Mbps Bitrate for 200MB-350MB Size)...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "h264",
      bitrate: "80M",
      outputLocation: path.join(outDir, "final_adobe_stock_master.mp4"),
      inputProps: { data: jsonData },
      chromiumOptions
    });
    console.log(`✅ Heavyweight Render Complete!`);
  }

  const title = jsonData.title || "Cinematic 4K Procedural Abstract Background";
  const tags = Array.isArray(jsonData.seoTags) ? jsonData.seoTags.join(", ") : "";
  const metadataContent = `TITLE:\n${title}\n\nTAGS (50):\n${tags}\n`;
  fs.writeFileSync(path.join(outDir, "metadata.txt"), metadataContent);
  console.log("📝 Metadata written.");
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
