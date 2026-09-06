import OpenAI from 'openai';
import fs from 'fs';

async function fetchLiveMarketData() {
  try {
    const response = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await response.text();
    const titles = [];
    const regex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) { titles.push(match[1]); }
    if (titles.length === 0) throw new Error("Empty Feed");
    return titles[0];
  } catch (err) {
    return "Cybernetic Artificial Intelligence";
  }
}

async function generate() {
  console.log("🌍 FETCHING #1 MARKET TREND...");
  const topTrend = await fetchLiveMarketData();
  console.log(`📊 TOP TREND DECIDED: [ ${topTrend} ]`);
  console.log(`🧠 USING EXPERIENTIAL LABS GATEWAY (claude-fable-5.1)...`);

  const apiKey = process.env.EXPLABS_API_KEY || "xpl_70bd1f22c9937297265c1682e573fbcb7df0d74f";
  
  if (!apiKey) {
    console.error("❌ EXPLABS_API_KEY is missing. Create one under Settings -> API keys.");
    process.exit(1);
  }

  const openai = new OpenAI({
    baseURL: "https://api.experientiallabs.ai/v1",
    apiKey: apiKey,
  });

  try {
    console.log(`🔌 Generating Topic-Specific Code...`);
    const completion = await openai.chat.completions.create({
      model: "claude-fable-5.1",
      messages: [
        { 
          role: "system", 
          content: `You are an elite Three.js VFX Developer. 
          DO NOT OUTPUT JSON. Output EXACTLY in this format:
          
          TITLE: <Commercial Adobe Stock Title>
          TAGS: <tag1, tag2, tag3, ..., max 30 tags>
          ===CODE_START===
          <Write pure Three.js execution logic here based on the exact market topic. Use scene, width, height, t. No markdown, no textures, no wrapping functions.>
          ===CODE_END===`
        },
        { 
          role: "user", 
          content: `MARKET TOPIC: [${topTrend}]. Design a highly complex, 100% unique procedural 3D background logic for this exact topic.` 
        }
      ],
      temperature: 1.0, // Fixed strictly to 1.0 as required by the route
      max_tokens: 4000
    });

    const responseText = completion.choices[0].message.content || "";
    
    const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
    const tagsMatch = responseText.match(/TAGS:\s*(.*)/i);
    const codeMatch = responseText.match(/===CODE_START===([\s\S]*?)===CODE_END===/i);

    if (!titleMatch || !tagsMatch || !codeMatch) {
      throw new Error("Missing delimiters in API output. Model format drifted.");
    }

    const finalTitle = titleMatch[1].trim();
    const finalTags = tagsMatch[1].split(',').map(t => t.trim());
    const finalThreeLogic = codeMatch[1].trim();

    console.log(`✅ Code successfully ripped! Total Tokens Used: ${completion.usage?.total_tokens || 'Unknown'}`);

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
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    mount.current.appendChild(renderer.domElement);

    try {
        const t = 0; 
        ${finalThreeLogic}
    } catch(e) { console.error("AI Logic Execution Error:", e); }
    
    const animate = () => {
      const t = frame / fps;
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

    const finalJson = { title: finalTitle, seoTags: finalTags, reactCode: reactCode };
    
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', JSON.stringify(finalJson, null, 2));
    
    console.log(`🎯 ASSET TITLE: ${finalTitle}`);
    
  } catch (error) {
    console.error("❌ Pipeline Failed:", error);
    process.exit(1);
  }
}

generate();