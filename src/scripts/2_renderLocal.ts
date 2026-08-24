import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

async function dualOptimizedRender(): Promise<void> {
  console.log("=======================================================================");
  console.log("🧹 PURGING ALL REMOTION & WEBPACK CACHES (DUAL INDEPENDENT PIPELINE)...");
  console.log("=======================================================================");

  const projectRoot = process.cwd();
  const jobIndex = process.env.JOB_INDEX || "0";

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
      trendTopic: "Quantum Neural Galaxy",
      clipCategory: "cinematic_galaxy",
      colorTheme: "#ff0055",
      particleCount: 18000
    },
    job2D: {
      trendTopic: "Fluid Energy Caustics",
      clipCategory: "fluid_caustics",
      colorTheme: "#00f0ff",
      customShader: "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 3.0 - 1.5; for(int i=1; i<5; i++) { vec2 newp = p; newp.x += 0.6/float(i)*sin(float(i)*p.y+time/2.0+0.3); newp.y += 0.6/float(i)*cos(float(i)*p.x+time/2.0+0.3); p = newp; } gl_FragColor = vec4(colorTheme * (0.5 / length(sin(p))), 1.0); }"
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

  const outDir = path.resolve(projectRoot, "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const out3D = path.join(outDir, "output_3d_premium.mp4");
  const out2D = path.join(outDir, "output_2d_premium.mp4");
  const legacy3D = path.join(outDir, `output_${jobIndex}_3d.mp4`);
  const legacy2D = path.join(outDir, `output_${jobIndex}_2d.mp4`);
  const finalVideo = path.join(outDir, "final_video.mp4");
  const universalOutput = path.join(outDir, "output.mp4");

  // 1. RENDER 3D PIPELINE
  console.log(`\n🎯 RENDERING JOB 3D: ${job3D.trendTopic} [${job3D.clipCategory}]...`);
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

  // 2. RENDER 2D PIPELINE
  console.log(`\n🎯 RENDERING JOB 2D: ${job2D.trendTopic} [${job2D.clipCategory}]...`);
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

  // Copy outputs for compatibility
  try {
    fs.copyFileSync(out3D, legacy3D);
    fs.copyFileSync(out2D, legacy2D);
    fs.copyFileSync(out3D, finalVideo);
    fs.copyFileSync(out3D, universalOutput);
  } catch {
    // Ignore copy error
  }

  console.log("\n🎉 DUAL INDEPENDENT RENDERING COMPLETED SUCCESSFULLY!");
  console.log(`   3D MP4: ${out3D}`);
  console.log(`   2D MP4: ${out2D}`);
}

dualOptimizedRender().catch((err) => {
  console.error("❌ Fatal Dual Render Error:", err);
  process.exit(1);
});
