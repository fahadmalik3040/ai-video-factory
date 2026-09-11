import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING SMART MODEL SNIPER & GHOST-STITCHER...");
  const url = "https://api.apinex.bond/v1/chat/completions";
  const apiKey = "sk-apxf8a26eaebc029becd1b83c59f9bd9f1da9a72590be0fa8d"; 
  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Futuristic AI";

  // Try the free Luna model first. If blocked by IP/New Account limits, gracefully fall back.
  const models = ["free/gpt-5.6-luna", "gpt-4o-mini", "gpt-3.5-turbo"];
  let success = false;

  for (const model of models) {
    console.log(`\n🔌 Trying model: [${model}]...`);
    try {
      const payload = {
        model: model,
        messages: [
          { 
            role: "system", 
            content: `You are an elite React-Three-Fiber developer. Output ONLY the raw internal React component body for a highly complex 3D scene.
DO NOT write imports. DO NOT write the export wrapper. 
Assume 'React', 'useRef', 'useFrame', 'THREE', and '@react-three/drei' are imported.

Output format EXACTLY like this:
TITLE: <Catchy Title>
TAGS: <tag1, tag2>
===LOGIC_START===
const meshRef = useRef(null);
useFrame(() => { if(meshRef.current) meshRef.current.rotation.x += 0.01; });
return <group><mesh ref={meshRef}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="hotpink"/></mesh></group>;
===LOGIC_END===`
          },
          { role: "user", content: `Topic: ${promptContent}. Generate ONLY the complex internal logic.` }
        ]
        // Removed temperature and max_tokens to prevent Free Tier parameter rejections
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content || "";

      let finalTitle = "Abstract Procedural Asset", finalTags = "abstract, 3d";
      const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
      if (titleMatch) finalTitle = titleMatch[1].trim();
      const tagsMatch = responseText.match(/TAGS:\s*(.*)/i);
      if (tagsMatch) finalTags = tagsMatch[1].trim();

      let coreLogic = "";
      const logicMatch = responseText.match(/===LOGIC_START===([\s\S]*?)===LOGIC_END===/i);
      if (logicMatch) {
          coreLogic = logicMatch[1].trim();
      } else {
          const split = responseText.split(/===LOGIC_START===/i);
          coreLogic = split.length > 1 ? split[1].replace(/===LOGIC_END===/i, '').trim() : responseText.trim();
      }

      const fullComponent = `import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float, Points, PointMaterial, Sphere, Box, Torus, Grid, MeshDistortMaterial, Stars, Sky } from '@react-three/drei';

export const AIGeneratedScene = () => {
  const frame = useCurrentFrame();
  ${coreLogic}
};
`;
      
      if (!fs.existsSync('data')) fs.mkdirSync('data');
      if (!fs.existsSync('src/scenes')) fs.mkdirSync('src/scenes', { recursive: true });
      if (!fs.existsSync('out')) fs.mkdirSync('out');
      
      fs.writeFileSync('src/scenes/AIGeneratedScene.tsx', fullComponent);
      fs.writeFileSync('out/metadata.txt', `TITLE:\n${finalTitle}\n\nTAGS:\n${finalTags}`);
      
      console.log(`✅ SUCCESS with ${model}! Scene Generated: ${finalTitle}`);
      success = true;
      break; 
    } catch (e: any) {
      console.error(`⚠️ Model ${model} failed (${e.message}). Bypassing restriction...`);
    }
  }

  if (!success) {
    console.error("❌ ALL models failed. The API key is fully blocked by the provider.");
    process.exit(1);
  }
}
generate();