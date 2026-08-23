import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { run3DAISwarm } from './generate_3d_swarm';
import { run2DAISwarm } from './generate_2d_swarm';

export async function orchestrateInfiniteGLSLFactory(targetTopic?: string, jobIdx?: number) {
  console.log("=======================================================================");
  console.log("🌌 SEQUENTIAL GLSL SHADER FACTORY: STRICT QUEUE + 15S REASONING DELAYS");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  console.log(`🎯 TARGET TRENDING TOPIC FOR JOB ${jobIndex}: "${promptContent}"`);

  // Step 1: Synthesize 3D Shader with full reasoning focus
  console.log(`⏳ [Queue 1/2] Initiating 3D Infinite GLSL Swarm...`);
  const metadata3D = await run3DAISwarm(promptContent, jobIndex);

  // 15-second breathing buffer for LLM contextual depth and zero rate-limiting
  console.log(`⏸️ [Rate-Limit Buffer] Pausing 15,000ms for deep contextual reasoning...`);
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // Step 2: Synthesize 2D Shader & Overlay with full reasoning focus
  console.log(`⏳ [Queue 2/2] Initiating 2D Infinite GLSL Swarm...`);
  const metadata2D = await run2DAISwarm(promptContent, jobIndex);

  // Assemble Unified Scene Data for Compatibility
  const unifiedData = {
    commercialConcept: metadata3D.commercialConcept || metadata2D.commercialConcept,
    glslFragmentShader: metadata3D.glslFragmentShader,
    uniforms: metadata3D.uniforms,
    engine2DOverlay: metadata2D.engine2DOverlay,
    seoPackage: {
      title: `${metadata3D.seoPackage?.title || promptContent} | 4K Stock Visuals`,
      description: `${metadata3D.seoPackage?.description || ''} & ${metadata2D.seoPackage?.description || ''}`,
      seoTags: Array.from(new Set([
        ...(metadata3D.seoPackage?.seoTags || []),
        ...(metadata2D.seoPackage?.seoTags || [])
      ]))
    },
    renderModes: ["3D", "2D"],
    metadata3D,
    metadata2D,
    colors: metadata3D.colors || metadata2D.colors,
    title: `Infinite GLSL 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\nCONCEPT:\n${unifiedData.commercialConcept}\n\n2D OVERLAY:\n${metadata2D.engine2DOverlay?.overlayType}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [SEQUENTIAL COMPLETE] BESPOKE SHADERS COMPILED AND SAVED FOR JOB ${jobIndex}!`);
  return unifiedData;
}

if (require.main === module) {
  orchestrateInfiniteGLSLFactory();
}
