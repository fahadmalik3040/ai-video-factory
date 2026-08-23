import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

let isRunning = true;

// Handle graceful termination
process.on("SIGINT", () => {
  console.log("\n🛑 [24/7 DAEMON] Received SIGINT. Gracefully shutting down after current cycle...");
  isRunning = false;
});

process.on("SIGTERM", () => {
  console.log("\n🛑 [24/7 DAEMON] Received SIGTERM. Gracefully shutting down after current cycle...");
  isRunning = false;
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runStep(command: string, description: string) {
  console.log(`\n▶️ [DAEMON STEP] ${description}...`);
  console.log(`   Command: ${command}`);
  try {
    execSync(command, {
      stdio: "inherit",
      env: process.env,
    });
    console.log(`✅ [DAEMON STEP COMPLETED] ${description}`);
    return true;
  } catch (err: any) {
    console.error(`❌ [DAEMON STEP ERROR] Error during ${description}:`, err.message);
    return false;
  }
}

async function startPerpetualVideoFactory() {
  console.log("=======================================================================");
  console.log("🏭 24/7 PERPETUAL AI VIDEO FACTORY: CONTINUOUS OMNI-PRODUCTION ENGINE");
  console.log("=======================================================================");

  let cycleCount = 0;
  const projectRoot = process.cwd();

  while (isRunning) {
    cycleCount++;
    const timestamp = new Date().toISOString();
    console.log(`\n\n#######################################################################`);
    console.log(`🚀 [CYCLE #${cycleCount} START] - ${timestamp}`);
    console.log(`#######################################################################`);

    try {
      // Ensure directories exist
      if (!fs.existsSync(path.resolve(projectRoot, "data"))) fs.mkdirSync("data", { recursive: true });
      if (!fs.existsSync(path.resolve(projectRoot, "out"))) fs.mkdirSync("out", { recursive: true });

      // Step 1: Fetch live RSS trending topics
      runStep("npx --yes tsx src/scripts/0_trendCatcher.ts", "Phase 1: Fetch Live RSS Trends");

      // Step 2: Generate Infinite GLSL Shader JSON via Sequential Swarm
      runStep("npx --yes tsx src/scripts/1_generateJson.ts", "Phase 2: Generate Sequential GLSL JSON");

      // Step 3: Render 4K 3D and 2D stock videos via Remotion Engine
      const renderSuccess = runStep("npx --yes tsx src/scripts/2_renderLocal.ts", "Phase 3: Render 4K Stock MP4s");

      if (renderSuccess) {
        // Step 4: Google Drive Archive Upload
        runStep("npx --yes tsx src/scripts/5_uploadDrive.ts", "Phase 4: Google Drive Backup");

        // Step 5: Omni-Platform Stock Agency FTP Distribution (Adobe, Shutterstock, Pond5)
        runStep("npx --yes tsx src/scripts/upload_omni.ts", "Phase 5: Omni-Platform FTP Stock Distribution");
      } else {
        console.warn(`⚠️ [DAEMON] Render phase encountered issues. Skipping distribution for cycle #${cycleCount}.`);
      }

      console.log(`\n🎉 [CYCLE #${cycleCount} FINISHED SUCCESSFULLY]`);
    } catch (cycleError: any) {
      console.error(`💥 [CRITICAL CYCLE ERROR] Uncaught exception in cycle #${cycleCount}:`, cycleError);
    }

    if (isRunning) {
      const cooldownSec = 10;
      console.log(`⏳ [COOLDOWN] Waiting ${cooldownSec} seconds before launching next production cycle...`);
      await sleep(cooldownSec * 1000);
    }
  }

  console.log("\n🏁 [24/7 DAEMON] Production factory shutdown complete. Goodbye!");
}

if (require.main === module) {
  startPerpetualVideoFactory();
}
