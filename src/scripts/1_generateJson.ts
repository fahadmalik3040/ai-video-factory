import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { run3DAISwarm } from './generate_3d_swarm';
import { run2DAISwarm } from './generate_2d_swarm';

async function orchestrateProVFXPipelines() {
  console.log("=======================================================================");
  console.log("🎬 PRO-VFX DIRECTOR ENGINE: INITIATING HIGH-END 3D & 2D MODULE ROUTING");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 TARGET TOPIC FOR JOB ${jobIndex}: "${promptContent}"`);

  // 1. Execute 3D Pro-VFX Module Selection
  const metadata3D = await run3DAISwarm(promptContent, jobIndex);

  // 2. Execute 2D Pro-Overlay Selection
  const metadata2D = await run2DAISwarm(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Backward Compatibility
  const unifiedData = {
    ...metadata3D,
    ...metadata2D,
    seoPackage: {
      title: `${metadata3D.seoPackage?.title || promptContent} | 4K Pro VFX Assets`,
      description: `${metadata3D.seoPackage?.description || ''} & ${metadata2D.seoPackage?.description || ''}`,
      seoTags: Array.from(new Set([
        ...(metadata3D.seoPackage?.seoTags || []),
        ...(metadata2D.seoPackage?.seoTags || [])
      ]))
    },
    renderModes: ["3D", "2D"],
    engine3D: metadata3D.engine3D,
    engine2D: metadata2D.engine2D,
    colors: metadata3D.engine3D?.themeColors || metadata2D.engine2D?.colors,
    title: `Pro VFX 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\n3D PRO MODULE:\n${metadata3D.engine3D?.activeModule}\n\n2D PRO OVERLAY:\n${metadata2D.engine2D?.activeOverlay}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [PRO-VFX COMPLETE] 3D (${metadata3D.engine3D?.activeModule}) & 2D (${metadata2D.engine2D?.activeOverlay}) READY FOR JOB ${jobIndex}!`);
}

orchestrateProVFXPipelines();
