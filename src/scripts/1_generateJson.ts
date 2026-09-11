import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING GHOST-STITCHING ENGINE (Timeout Bypass)...");
  const url = "https://api.apinex.bond/v1/chat/completions";
  // Uses your environment variable or fallback key
  const apiKey = process.env.APINEX_API_KEY || "sk-apxab7f2fa3d6a2e78dbfa536ae126b9644f532a24f8c86e89"; 
  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Futuristic AI";

  console.log(`\n🔌 Tricking AI to generate ONLY core logic to beat the 100s clock...`);
  try {
    const payload = {
      model: "free/gpt-5.6-luna",
      messages: [
        { 
          role: "system", 
          content: `You are an elite React-Three-Fiber developer. Output ONLY the raw internal React component body for a highly complex 3D scene.
DO NOT write imports. DO NOT write the export function wrapper. 
Assume 'React', 'useRef', 'useFrame', 'THREE', and all '@react-three/drei' components are already imported.
Assume you have access to the 'frame' variable.

Output format EXACTLY like this:
TITLE: <Catchy Title>
TAGS: <tag1, tag2>
===LOGIC_START===
const meshRef = useRef(null);
useFrame(() => {
  if(meshRef.current) meshRef.current.rotation.x += 0.01;
});
return (
  <group>
    <mesh ref={meshRef}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  </group>
);
===LOGIC_END===`
        },
        { role: "user", content: `Topic: ${promptContent}. Generate ONLY the highly complex internal logic.` }
      ],
      temperature: 0.8
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
        const split = responseText.split('===LOGIC_START===');
        coreLogic = split.length > 1 ? split[1].replace('===LOGIC_END===', '').trim() : responseText.trim();
    }

    // 🧠 THE GHOST STITCHER: We build the full file instantly in Node to prevent Undefined crashes
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
    
    console.log(`✅ SUCCESS! Bypassed 524 Timeout. Scene Generated: ${finalTitle}`);
  } catch (e: any) {
    console.error(`⚠️ Model failed: ${e.message}`);
    process.exit(1);
  }
}
generate();