import fs from 'fs';

async function generate() {
  console.log("🚀 INITIATING CLOUDFLARE-BYPASS STREAMING ENGINE...");
  const url = "https://api.apinex.bond/v1/chat/completions";
  const apiKey = "sk-apxab7f2fa3d6a2e78dbfa536ae126b9644f532a24f8c86e89"; 
  const promptContent = fs.existsSync('data/prompts.csv') ? fs.readFileSync('data/prompts.csv', 'utf-8') : "Futuristic AI";

  let success = false;
  const model = "free/gpt-5.6-luna";
  
  console.log(`\n🔌 Streaming code chunk-by-chunk from [${model}] to bypass 524 timeout...`);
  try {
    const payload = {
      model: model,
      messages: [
        { 
          role: "system", 
          content: `You are an elite WebGL/React-Three-Fiber developer. DO NOT output JSON. Output EXACTLY in this format:
TITLE: <Catchy Title>
TAGS: <tag1, tag2>
===CODE_START===
import React, { useRef, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float, Points, PointMaterial, Sphere, Box, Icosahedron, Torus, Grid } from '@react-three/drei';

export const AIGeneratedScene = () => {
  const frame = useCurrentFrame();
  return <group>{/* YOUR COMPLEX 3D LOGIC HERE */}</group>;
};
===CODE_END===`
        },
        { role: "user", content: `Write unique procedural 3D code for: ${promptContent}` }
      ],
      stream: true // CRITICAL: This bypasses Cloudflare's 100s timeout
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let responseText = "";
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices[0].delta?.content) {
              responseText += data.choices[0].delta.content;
            }
          } catch(e) {}
        }
      }
    }

    let finalTitle = "Abstract Procedural Asset", finalTags = "abstract, 3d";
    const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
    if (titleMatch) finalTitle = titleMatch[1].trim();
    const tagsMatch = responseText.match(/TAGS:\s*(.*)/i);
    if (tagsMatch) finalTags = tagsMatch[1].trim();

    let finalCode = "";
    const codeMatch = responseText.match(/===CODE_START===([\s\S]*?)===CODE_END===/i);
    if (codeMatch) finalCode = codeMatch[1].trim();
    else throw new Error("Missing delimiters.");

    // TITANIUM REGEX FIXES: Force correct export name and strip markdown
    finalCode = finalCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
    
    // Catch generic default exports
    finalCode = finalCode.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'export const AIGeneratedScene = function');
    // Catch named const exports
    finalCode = finalCode.replace(/(export\s+const\s+)([A-Za-z0-9_]+)(\s*=)/g, '$1AIGeneratedScene$3');
    // Catch default variables
    finalCode = finalCode.replace(/export\s+default\s+([A-Za-z0-9_]+);/g, 'export const AIGeneratedScene = $1;');
    
    // THE ULTIMATE BRUTE-FORCE FALLBACK
    // If the AI completely failed to name the export, we append a safe fallback so Remotion NEVER crashes
    if (!finalCode.includes('AIGeneratedScene')) {
      finalCode += `\n\n// Safety Fallback\nexport const AIGeneratedScene = () => <div style={{width: '100%', height: '100%', backgroundColor: '#000'}}><h1 style={{color: 'red'}}>AI Syntax Export Error - Retrying in next loop</h1></div>;`;
    }
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('src/scenes')) fs.mkdirSync('src/scenes', { recursive: true });
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('src/scenes/AIGeneratedScene.tsx', finalCode);
    fs.writeFileSync('out/metadata.txt', `TITLE:\n${finalTitle}\n\nTAGS:\n${finalTags}`);
    
    console.log(`✅ SUCCESS! AI Coded scene for: ${finalTitle}`);
    success = true; 
  } catch (e: any) {
    console.error(`⚠️ Model failed: ${e.message}`);
  }
  
  if (!success) { console.error("❌ Generation completely failed."); process.exit(1); }
}
generate();