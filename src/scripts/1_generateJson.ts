import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { run3DAISwarm } from './generate_3d_swarm';
import { run2DAISwarm } from './generate_2d_swarm';

async function orchestrateInfiniteGLSLFactory() {
  console.log("=======================================================================");
  console.log("🌌 INFINITE GLSL SHADER FACTORY: ZERO ENUMS, PURE PROCEDURAL GPU MATH");
  console.log("=======================================================================");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 TARGET TRENDING TOPIC FOR JOB ${jobIndex}: "${promptContent}"`);

  // 1. Synthesize Bespoke 3D GPU GLSL Shader
  const metadata3D = await run3DAISwarm(promptContent, jobIndex);

  // 2. Synthesize Bespoke 2D GPU GLSL Shader + Overlay
  const metadata2D = await run2DAISwarm(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Compatibility
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

  console.log(`\n🎉 [INFINITE GLSL COMPLETE] BESPOKE SHADERS COMPILED AND SAVED FOR JOB ${jobIndex}!`);
}

orchestrateInfiniteGLSLFactory();
