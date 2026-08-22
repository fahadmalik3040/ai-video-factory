import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { run3DAISwarm } from './generate_3d_swarm';
import { run2DAISwarm } from './generate_2d_swarm';

async function orchestrateFullSwarmPipelines() {
  console.log("=======================================================================");
  console.log("🤖 7-AGENT MULTI-AI SWARM AGENCY: INITIATING SEQUENTIAL CHAIN PIPELINES");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 TARGET TOPIC FOR JOB ${jobIndex}: "${promptContent}"`);

  // 1. Execute 4-Agent 3D Swarm Pipeline
  const master3D = await run3DAISwarm(promptContent, jobIndex);

  // 2. Execute 3-Agent 2D Swarm Pipeline
  const master2D = await run2DAISwarm(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Compatibility
  const unifiedData = {
    ...master3D,
    ...master2D,
    seoPackage: {
      title: `${master3D.seoPackage?.title || promptContent} | 4K Stock Visuals`,
      description: `${master3D.seoPackage?.description || ''} & ${master2D.seoPackage?.description || ''}`,
      seoTags: Array.from(new Set([
        ...(master3D.seoPackage?.seoTags || []),
        ...(master2D.seoPackage?.seoTags || [])
      ]))
    },
    renderModes: ["3D", "2D"],
    engine3D: master3D.engine3D,
    engine2D: master2D.engine2D,
    master3D,
    master2D,
    colors: master3D.colors || master2D.colors,
    title: `Swarm VFX 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\n3D SWARM MESH:\n${master3D.mathTD?.geometryMeshType}\n\n3D CAMERA FOV:\n${master3D.cinematography?.cameraDP?.lensFOV}\n\n2D SWARM ARCHETYPE:\n${master2D.motionDirector?.visualStructure?.archetypeName}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [7-AGENT SWARM COMPLETE] ALL 3D & 2D AGENTS CONVERGED AND SAVED FOR JOB ${jobIndex}!`);
}

orchestrateFullSwarmPipelines();
