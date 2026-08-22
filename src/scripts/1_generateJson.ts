import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { run3DAISwarm } from './generate_3d_swarm';
import { run2DAISwarm } from './generate_2d_swarm';

async function orchestratePureGLSLPipelines() {
  console.log("=======================================================================");
  console.log("🔥 PURE GLSL SHADER ARCHITECTURE: INITIATING PROCEDURAL FLUID SIMULATION");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 TARGET TOPIC FOR JOB ${jobIndex}: "${promptContent}"`);

  // 1. Generate 3D Pure GLSL Shader Payload
  const metadata3D = await run3DAISwarm(promptContent, jobIndex);

  // 2. Generate 2D Pure GLSL Shader Payload
  const metadata2D = await run2DAISwarm(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Compatibility
  const unifiedData = {
    vfxCategory: metadata3D.vfxCategory || metadata2D.vfxCategory,
    glslFragmentShader: metadata3D.glslFragmentShader || metadata2D.glslFragmentShader,
    uniforms: metadata3D.uniforms || metadata2D.uniforms,
    seoPackage: {
      title: `${metadata3D.seoPackage?.title || promptContent} | 4K GLSL Procedural Shader`,
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
    title: `GLSL 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\nGLSL VFX CATEGORY:\n${unifiedData.vfxCategory}\n\nUNIFORM SPEED:\n${unifiedData.uniforms?.speed}\n\nUNIFORM DENSITY:\n${unifiedData.uniforms?.density}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [GLSL COMPLETE] 3D (${metadata3D.vfxCategory}) & 2D (${metadata2D.vfxCategory}) COMPILED FOR JOB ${jobIndex}!`);
}

orchestratePureGLSLPipelines();
