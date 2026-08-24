import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

async function dualOptimizedRender(): Promise<void> {
  console.log("=======================================================================");
  console.log("🧹 PURGING OUTPUT DIRECTORY & CACHES (STRICT DUAL PIPELINE)...");
  console.log("=======================================================================");

  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";

  // 1. COMPLETELY PURGE OUTPUT FOLDER (Prevents duplicate video accumulation)
  const outDir = path.resolve(projectRoot, "out");
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  const cacheDirs = [
    path.resolve(projectRoot, ".remotion"),
    path.resolve(projectRoot, "node_modules/.cache/remotion"),
    path.resolve(projectRoot, "node_modules/.cache/webpack"),
  ];

  for (const dir of cacheDirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   Deleted cache: ${dir}`);
      } catch {
        // Ignore error
      }
    }
  }

  // Load fresh dual metadata
  const sceneDataPath = path.resolve(projectRoot, "data", "sceneData.json");
  const fallbackPath = path.resolve(projectRoot, "data", `metadata_${jobIndex}.json`);

  let jsonData: any = {
    job3D: {
      trendTopic: "Sci-Fi Infinite 3D Tunnel 4K",
      clipCategory: "sci_fi_3d_tunnels",
      colorTheme: "#ff0055",
      aiSDFMath: "float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }"
    },
    job2D: {
      trendTopic: "Liquid Gradient Waves 4K",
      clipCategory: "liquid_gradient_waves",
      colorTheme: "#00ffcc",
      aiGLSLCode: "void main() { vec2 p = vUv * 2.0 - 1.0; float n = fbm(p * 2.0 + vec2(time * 0.2, time * 0.15)); float wave = sin(p.x * 4.0 + n * 3.0 + time) * 0.5 + 0.5; gl_FragColor = vec4(mix(colorTheme, vec3(0.1, 0.0, 0.2), wave) + (0.05 / (abs(p.y - sin(p.x * 3.0 + time)*0.3) + 0.05)), 1.0); }"
    }
  };

  if (fs.existsSync(sceneDataPath)) {
    try {
      jsonData = JSON.parse(fs.readFileSync(sceneDataPath, "utf8"));
    } catch {
      // Ignore
    }
  } else if (fs.existsSync(fallbackPath)) {
    try {
      jsonData = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    } catch {
      // Ignore
    }
  }

  const job3D = jsonData.job3D || jsonData;
  const job2D = jsonData.job2D || jsonData;

  console.log("📦 Bundling Remotion project for Dual Render Engine...");
  const bundled = await bundle({
    entryPoint: path.resolve(projectRoot, "src/index.ts"),
    webpackOverride: (config) => ({
      ...config,
      cache: false,
    }),
  });

  const comps = await getCompositions(bundled, { inputProps: { job3D, job2D } });
  const comp3D = comps.find((c) => c.id === "Main3D" || c.id === "MainVideo") || comps[0];
  const comp2D = comps.find((c) => c.id === "Main2D") || comps[1] || comps[0];

  if (!comp3D || !comp2D) {
    throw new Error("❌ Remotion compositions (Main3D/Main2D) not found!");
  }

  const out3D = path.join(outDir, "final_3d_premium.mp4");
  const out2D = path.join(outDir, "final_2d_premium.mp4");

  // 1. RENDER STRICTLY ONE 3D VIDEO
  console.log(`\n🎯 RENDERING EXACTLY ONE 3D VIDEO: ${job3D.trendTopic} [${job3D.clipCategory}]...`);
  await renderMedia({
    composition: comp3D,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: out3D,
    inputProps: { data: job3D, job3D },
    videoBitrate: "40M",
    pixelFormat: "yuv420p",
    concurrency: 1,
    timeoutInMilliseconds: 600000,
    chromiumOptions: {
      disableWebSecurity: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    }
  });
  console.log(`✅ 3D Render Complete: ${out3D}`);

  // 2. RENDER STRICTLY ONE 2D VIDEO
  console.log(`\n🎯 RENDERING EXACTLY ONE 2D VIDEO: ${job2D.trendTopic} [${job2D.clipCategory}]...`);
  await renderMedia({
    composition: comp2D,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: out2D,
    inputProps: { data: job2D, job2D },
    videoBitrate: "40M",
    pixelFormat: "yuv420p",
    concurrency: 1,
    timeoutInMilliseconds: 600000,
    chromiumOptions: {
      disableWebSecurity: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    }
  });
  console.log(`✅ 2D Render Complete: ${out2D}`);

  console.log("\n=======================================================================");
  console.log("🎉 RENDER PIPELINE FINISHED. EXACTLY 2 VIDEOS GENERATED:");
  console.log(`   1. ${out3D}`);
  console.log(`   2. ${out2D}`);
  console.log("=======================================================================");
}

dualOptimizedRender().catch((err) => {
  console.error("❌ Fatal Stock Factory Render Error:", err);
  process.exit(1);
});
