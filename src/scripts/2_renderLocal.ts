import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

// 🧹 AUTO-CLEANER: Removes fuzool grids, axes, and helpers from all React components
function removeFuzoolChezein(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeFuzoolChezein(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      
      // Regular expressions to strip out development helpers
      content = content.replace(/<gridHelper[^>]*\/>/gi, '');
      content = content.replace(/<axesHelper[^>]*\/>/gi, '');
      content = content.replace(/<boxHelper[^>]*\/>/gi, '');
      content = content.replace(/<Stats[^>]*\/>/gi, '');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`🧹 Cleaned up fuzool chezein from: ${file}`);
      }
    }
  }
}

const run = async () => {
  console.log("🧹 Scanning and removing fuzool grids/helpers from code...");
  removeFuzoolChezein(path.resolve("src"));

  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("videoConfig.json not found!");
  }
  const jsonData = fs.readJsonSync(jsonPath);

  console.log("📦 Bundling project for Heavyweight Adobe Stock 4K (2D & 3D)...");
  const bundled = await bundle({ entryPoint: path.resolve("./src/index.ts"), webpackOverride: (config) => config });

  // Bulletproof Headless WebGL Flags
  const chromiumOptions = {
    gl: "angle",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--disable-features=Vulkan",
      "--enable-webgl"
    ]
  };

  const comps = await getCompositions(bundled, { 
    inputProps: { data: jsonData },
    chromiumOptions 
  });

  // Extract both 2D and 3D compositions
  const comp2D = comps.find(c => c.id.toLowerCase().includes('2d') || c.id === 'Main2D');
  const comp3D = comps.find(c => c.id.toLowerCase().includes('3d') || c.id === 'Main3D');
  
  let renderedCount = 0;

  // Render 2D Masterpiece
  if (comp2D) {
    console.log(`🎯 RENDERING 2D MASTERPIECE (Clean 4K, 80Mbps)...`);
    await renderMedia({
      composition: comp2D,
      serveUrl: bundled,
      codec: "h264",
      bitrate: "80M",
      concurrency: 1,
      outputLocation: path.join(outDir, "final_adobe_stock_2D.mp4"),
      inputProps: { data: jsonData },
      chromiumOptions
    });
    console.log(`✅ 2D Render Complete!`);
    renderedCount++;
  }

  // Render 3D Masterpiece
  if (comp3D) {
    console.log(`🎯 RENDERING 3D MASTERPIECE (Clean 4K, 80Mbps)...`);
    await renderMedia({
      composition: comp3D,
      serveUrl: bundled,
      codec: "h264",
      bitrate: "80M",
      concurrency: 1,
      outputLocation: path.join(outDir, "final_adobe_stock_3D.mp4"),
      inputProps: { data: jsonData },
      chromiumOptions
    });
    console.log(`✅ 3D Render Complete!`);
    renderedCount++;
  }

  // Fallback just in case names don't match
  if (renderedCount === 0) {
    console.warn("⚠️ Could not find specifically named 2D or 3D comps. Rendering default...");
    await renderMedia({
      composition: comps[0],
      serveUrl: bundled,
      codec: "h264",
      bitrate: "80M",
      concurrency: 1,
      outputLocation: path.join(outDir, "final_adobe_stock_master.mp4"),
      inputProps: { data: jsonData },
      chromiumOptions
    });
  }

  const title = jsonData.title || "Cinematic 4K Procedural Abstract Background";
  const tags = Array.isArray(jsonData.seoTags) ? jsonData.seoTags.join(", ") : "";
  const metadataContent = `TITLE:\n${title}\n\nTAGS (50):\n${tags}\n`;
  fs.writeFileSync(path.join(outDir, "metadata.txt"), metadataContent);
  console.log("📝 Metadata written successfully.");
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
