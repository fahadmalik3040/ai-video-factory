import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { generate3DMetadata } from './1_generateJson_3d';
import { generate2DMetadata } from './1_generateJson_2d';

async function orchestrateAllGenerators() {
  console.log("🚀 INITIATING SEPARATE DUAL DEDICATED GENERATION PIPELINES (3D & 2D)...");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 JOB ${jobIndex} ASSIGNED TOPIC: "${promptContent}"`);

  // 1. Generate Dedicated 3D Scene Metadata
  const metadata3D = await generate3DMetadata(promptContent, jobIndex);

  // 2. Generate Dedicated 2D Motion Graphics Metadata
  const metadata2D = await generate2DMetadata(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Compatibility
  const unifiedData = {
    seoPackage: {
      title: `${metadata3D.seoPackage?.title || promptContent} | 4K Stock Visuals`,
      description: `${metadata3D.seoPackage?.description || ''} & ${metadata2D.seoPackage?.description || ''}`,
      seoTags: Array.from(new Set([
        ...(metadata3D.seoPackage?.seoTags || []),
        ...(metadata2D.seoPackage?.seoTags || [])
      ]))
    },
    renderModes: ["3D", "2D"],
    engine3D: metadata3D.engine3D,
    engine2D: metadata2D.engine2D,
    colors: metadata3D.engine3D?.colors || metadata2D.engine2D?.colorPalette,
    title: `Dual-Render 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\nMODES:\n3D, 2D\n\n3D GEOMETRY:\n${metadata3D.engine3D?.solidGeometry} (${metadata3D.engine3D?.layoutMath})\n\n2D ARCHETYPE:\n${metadata2D.engine2D?.layoutStructure}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`✅ [COMPLETE] INDEPENDENT 3D & 2D METADATA GENERATED FOR JOB ${jobIndex}!`);
  console.log(`   3D: ${metadata3D.engine3D?.solidGeometry} | Camera: ${metadata3D.engine3D?.cinematographyDP?.cameraPath}`);
  console.log(`   2D Archetype: ${metadata2D.engine2D?.layoutStructure}`);
}

orchestrateAllGenerators();
