import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";

const runRender = async () => {
  const outDir = path.resolve("out");
  fs.ensureDirSync(outDir);

  const cacheDir = path.resolve(process.cwd(), "node_modules/.cache");
  if (fs.existsSync(cacheDir)) fs.removeSync(cacheDir);

  // Generate a totally unique ID for EVERY single render run
  const uniqueSeed = crypto.randomUUID();
  const timestamp = Date.now();

  console.log(`🎯 RENDERING UNIQUE VIDEO WITH SEED: ${uniqueSeed}`);

  console.log("📦 Bundling Remotion project for 4K dynamic render...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
    webpackOverride: (config) => config,
  });

  const dynamicInputProps = {
    seed: uniqueSeed,
    themeColor: Math.random() > 0.5 ? "hotpink" : "cyan",
  };

  const chromiumOptions = {
    gl: "angle" as const,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-angle=swiftshader", "--disable-gpu", "--enable-webgl"],
  };

  const comps = await getCompositions(bundleLocation, {
    inputProps: dynamicInputProps,
    chromiumOptions,
  });

  const composition = comps.find((c) => c.id === "MasterScene") || comps[0];

  if (!composition) {
    throw new Error("No composition found to render!");
  }

  const outputLocation = path.join(outDir, `video_${timestamp}.mp4`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps: dynamicInputProps,
    chromiumOptions,
  });

  console.log(`✅ 4K UNIQUE CLOUD RENDER DONE: ${outputLocation}`);
};

runRender().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
