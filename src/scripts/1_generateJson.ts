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
  
  console.log(`🧠 INITIATING APINEX BEAST ENGINE (free/gpt-5.6-luna)...`);
  
  const url = "https://api.apinex.bond/v1/chat/completions";
  const apiKey = "sk-apxab7f2fa3d6a2e78dbfa536ae126b9644f532a24f8c86e89"; 

  const payload = {
    model: "free/gpt-5.6-luna",
    messages: [
      { 
        role: "system", 
        content: `You are an elite Three.js VFX Developer. DO NOT use conversational filler.
        Output EXACTLY in this format using these exact delimiters:
        
        TITLE: <Commercial Adobe Stock Title>
        TAGS: <tag1, tag2, tag3>
        ===CODE_START===
        // Write pure Three.js execution logic here using scene, width, height, t. No wrapping functions.
        ===CODE_END===`
      },
      { 
        role: "user", 
        content: `MARKET TOPIC: [${topTrend}]. Design highly complex procedural 3D background logic.` 
      }
    ],
    temperature: 0.8
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const responseText = data.choices[0].message.content || "";
    
    let finalTitle = "4K Cinematic Abstract Visual";
    let finalTags = ["abstract", "4k", "motion", "background"];
    let finalThreeLogic = "";

    const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
    if (titleMatch) finalTitle = titleMatch[1].trim();

    const tagsMatch = responseText.match(/TAGS:\s*(.*)/i);
    if (tagsMatch) finalTags = tagsMatch[1].split(',').map(t => t.trim());

    // Titanium-Grade Parser with Ultimate Fallback
    const codeMatch = responseText.match(/===CODE_START===([\s\S]*?)===CODE_END===/i);
    const markdownMatch = responseText.match(/```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/i);

    if (codeMatch) {
        finalThreeLogic = codeMatch[1].trim();
    } else if (markdownMatch) {
        console.log("⚠️ Delimiters missing. Rescued via Markdown block.");
        finalThreeLogic = markdownMatch[1].trim();
    } else {
        console.log("⚠️ Extreme Drift! Engaging Fallback logic.");
        const splitText = responseText.split(/TAGS:.*?\n/i);
        finalThreeLogic = splitText.length > 1 ? splitText[1].trim() : responseText.trim();
        finalThreeLogic = finalThreeLogic.replace(/^(Here is the code|Sure).*?\n/i, "");
    }

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
    
    console.log(`✅ APINEX LUNA SUCCESS! ASSET TITLE: ${finalTitle}`);
    
  } catch (error) {
    console.error("❌ Pipeline Failed:", error);
    process.exit(1);
  }
}

generate();