import fs from 'fs';
import { getJobTopic } from './llmHelper';
import { generate3DMetadata } from './1_generateJson_3d';
import { generate2DMetadata } from './1_generateJson_2d';

async function orchestrateAllGenerators() {
  console.log("🚀 INITIATING COMMERCIAL STOCK VIDEO ORCHESTRATION PIPELINES (3D & 2D)...");

  const { topic: promptContent, jobIndex } = getJobTopic();
  console.log(`🎯 JOB ${jobIndex} ASSIGNED TOPIC: "${promptContent}"`);

  // 1. Generate Dedicated 3D Scene Metadata (Commercial Stock)
  const metadata3D = await generate3DMetadata(promptContent, jobIndex);

  // 2. Generate Dedicated 2D Motion Graphics Metadata (Commercial Stock)
  const metadata2D = await generate2DMetadata(promptContent, jobIndex);

  // 3. Assemble Unified Scene Data for Compatibility
  const unifiedData = {
    commercialMarketCategory: metadata3D.commercialMarketCategory || metadata2D.commercialMarketCategory,
    visualStructure: metadata3D.visualStructure || metadata2D.visualStructure,
    commercialColors: metadata3D.commercialColors || metadata2D.commercialColors,
    cinematicEditorNeeds: metadata3D.cinematicEditorNeeds || metadata2D.cinematicEditorNeeds,
    seoPackage: {
      title: `${metadata3D.seoPackage?.title || promptContent} | 4K Commercial Stock Video`,
      description: `${metadata3D.seoPackage?.description || ''} & ${metadata2D.seoPackage?.description || ''}`,
      seoTags: Array.from(new Set([
        ...(metadata3D.seoPackage?.seoTags || []),
        ...(metadata2D.seoPackage?.seoTags || [])
      ]))
    },
    renderModes: ["3D", "2D"],
    engine3D: metadata3D.engine3D,
    engine2D: metadata2D.engine2D,
    cinematicVFX: metadata3D.cinematicVFX,
    environment: metadata3D.environment,
    cameraDP: metadata3D.cameraDP,
    compositionLayers: metadata3D.compositionLayers,
    colors: metadata3D.engine3D?.colors || metadata2D.engine2D?.colorPalette,
    title: `Commercial 4K: ${promptContent}`
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(unifiedData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(unifiedData, null, 2));

  const metadataContent = `TITLE:\n${unifiedData.seoPackage.title}\n\nCOMMERCIAL CATEGORY:\n${unifiedData.commercialMarketCategory}\n\nCINEMATIC PACING:\n${unifiedData.cinematicEditorNeeds?.cameraPacing || "ultra_slow_continuous"}\n\nNEGATIVE SPACE:\n${unifiedData.cinematicEditorNeeds?.negativeSpace || "left_side_open_for_text"}\n\nTAGS:\n${unifiedData.seoPackage.seoTags.join(", ")}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`✅ [COMPLETE] COMMERCIAL 3D & 2D STOCK METADATA SAVED FOR JOB ${jobIndex}!`);
  console.log(`   Market Category: ${unifiedData.commercialMarketCategory}`);
  console.log(`   3D Hero: ${metadata3D.compositionLayers?.[1]?.geometry} (${metadata3D.compositionLayers?.[1]?.materialStyle})`);
  console.log(`   2D Archetype: ${metadata2D.engine2D?.layoutStructure}`);
}

orchestrateAllGenerators();
