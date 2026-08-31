import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

const run = async () => {
  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("videoConfig.json not found! Run generateJson first.");
  }
  const jsonData = fs.readJsonSync(jsonPath);

  console.log("📦 Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });

  const chromiumOptions = {
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blocklist", "--enable-webgl"]
  };

  const comps = await getCompositions(bundled, { 
    inputProps: { data: jsonData },
    chromiumOptions 
  });

  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D') || comps[0];
  
  if (comp3D) {
    console.log(`🎯 RENDERING 4K MASTERPIECE...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "prores",
      proResProfile: "4444",
      outputLocation: path.join(outDir, "final_video.mov"),
      inputProps: { data: jsonData },
      chromiumOptions
    });
    console.log(`✅ Video Render Complete!`);
  }

  // Generate metadata.txt directly inside outDir AFTER render
  const title = jsonData.title || "Cinematic 4K Procedural Abstract Background";
  const tags = Array.isArray(jsonData.seoTags) ? jsonData.seoTags.join(", ") : "";

  const metadataContent = `TITLE:\n${title}\n\nTAGS (50):\n${tags}\n`;
  fs.writeFileSync(path.join(outDir, "metadata.txt"), metadataContent);
  console.log("📝 SEO metadata.txt successfully written to out/metadata.txt");
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
