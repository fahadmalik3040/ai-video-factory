import OpenAI from 'openai';
import fs from 'fs';

// 🌍 1. PURE MARKET RESEARCH
async function fetchLiveMarketData() {
  try {
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    const titles = [];
    const regex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) { titles.push(match[1]); }
    if (titles.length === 0) throw new Error("Empty Feed");
    return titles[0]; // ONLY TAKING THE #1 ABSOLUTE TOP TRENDING TOPIC
  } catch (err) {
    return "Cybernetic Artificial Intelligence";
  }
}

async function generate() {
  console.log("🌍 FETCHING #1 MARKET TREND...");
  const topTrend = await fetchLiveMarketData();
  console.log(`📊 TOP TREND DECIDED: [ ${topTrend} ]`);
  
  console.log(`🧠 FORCING AI TO DESIGN 100% UNIQUE VISUALS STRICTLY FOR: ${topTrend}...`);

  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || "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",
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  const survivorModels = ["meta/llama-3.1-8b-instruct", "google/gemma-2-9b-it"];
  let aiData = null;

  for (const modelId of survivorModels) {
    try {
      console.log(`🔌 Generating Topic-Specific Code via [${modelId}]...`);
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { 
            role: "system", 
            content: `You are an elite Three.js VFX Developer. Output STRICTLY JSON ONLY.
            Keys required:
            1. "title" (Commercial title based on the topic)
            2. "seoTags" (Array of 30 tags)
            3. "threeLogic" (The inner JavaScript code to create the 3D scene)
            
            CRITICAL RULE FOR 'threeLogic':
            - The visuals MUST perfectly represent the User's Market Topic.
            - If the topic is 'Ocean', create moving fluid geometry. If 'Cyberpunk', create neon wireframes. If 'Data', create floating particles.
            - Write ONLY the code that goes INSIDE a standard Three.js scene setup.
            - You have access to these variables: 'scene', 'width', 'height', 't' (time).
            - Do NOT use textures, loaders, or external assets. Use pure procedural geometry, Points, Lines, or basic Shaders.
            - DO NOT wrap the code in a function. Just write the raw execution code.
            
            Example of what 'threeLogic' should look like:
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);
            mesh.rotation.y = t;
            `
          },
          { 
            role: "user", 
            content: `MARKET TOPIC: [${topTrend}]. Design and code a highly complex, premium 3D abstract background that visually represents this exact topic from scratch.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });
      aiData = JSON.parse(completion.choices[0].message.content || "{}");
      if(aiData.threeLogic) break;
    } catch (error) {
      console.warn(`⚠️ Model failed. Rotating...`);
    }
  }

  if(!aiData || !aiData.threeLogic) {
      console.error("❌ Failed to generate custom topic logic.");
      process.exit(1);
  }

  // 🧬 INJECTING AI'S TOPIC-SPECIFIC LOGIC INTO THE REACT PLAYER
  const reactCode = `
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export const BawalAsset = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const mount = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(null);
  
  useEffect(() => {
    if (!mount.current) return;
    
    // Base Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    mount.current.appendChild(renderer.domElement);

    // AI'S TOPIC-SPECIFIC GENERATED GEOMETRY & LOGIC
    // This changes completely based on the market trend
    try {
        const t = 0; // Initial time
        ${aiData.threeLogic}
    } catch(e) { console.error("AI Logic Error:", e); }
    
    const animate = () => {
      const t = frame / fps;
      // We traverse the scene to animate whatever the AI built
      scene.children.forEach((child, i) => {
         if(child.isMesh || child.isPoints || child.isLine) {
             child.rotation.x = t * 0.2 + (i * 0.01);
             child.rotation.y = t * 0.3 + (i * 0.01);
         }
      });
      renderer.render(scene, camera);
    };
    animate();
    
    return () => { mount.current?.removeChild(renderer.domElement); renderer.dispose(); };
  }, [frame, width, height, fps]);

  return <div ref={mount} style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />;
};
  `;

  const finalJson = { 
      title: aiData.title, 
      seoTags: aiData.seoTags,
      reactCode: reactCode 
  };
  
  if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/videoConfig.json', JSON.stringify(finalJson, null, 2));
  
  console.log(`✅ EXACT TOPIC-DRIVEN CODE GENERATED!`);
  console.log(`🎯 ASSET TITLE: ${aiData.title}`);
}

generate().catch(console.error);