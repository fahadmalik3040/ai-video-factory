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
    return titles.slice(0, 5).join(", ");
  } catch (err) {
    return "Cyber Security, Dark Matter, AI Neural Networks, Quantum Fluid";
  }
}

async function generate() {
  console.log("🌍 FETCHING LIVE MARKET TRENDS...");
  const marketData = await fetchLiveMarketData();
  
  console.log("🧨 ACTIVATING NO-TEMPLATE PURE GENERATIVE ENGINE...");
  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || "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",
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  const survivorModels = [
    "meta/llama-3.1-8b-instruct", 
    "google/gemma-2-9b-it", 
    "mistralai/mistral-7b-instruct-v0.3"
  ];
  
  let aiData = null;

  for (const modelId of survivorModels) {
    try {
      console.log(`🔌 FORCING MODEL [${modelId}] TO WRITE PURE RAW GLSL SHADER FROM SCRATCH...`);
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { 
            role: "system", 
            content: `You are a legendary WebGL Demoscene coder. You NEVER use templates. You invent new math every time.
            Output STRICTLY JSON ONLY. No markdown, no text.
            Keys required:
            1. "title" (Commercial Adobe Stock title)
            2. "seoTags" (Array of 30 buyer tags)
            3. "glsl" (A COMPLETE, highly complex, stunning fragment shader string written in GLSL. Must use raymarching, fractals, or fluid noise. Must be cinematic and commercial quality.)
            
            RULES FOR 'glsl':
            - Must use these exact uniforms: uniform float u_time; uniform vec2 u_resolution;
            - Must define 'void main() { ... }'
            - Output MUST be a valid string. Escape newlines properly if needed.
            - Never use external textures (no sampler2D).`
          },
          { 
            role: "user", 
            content: `Market Demand: [${marketData}]. Write a completely unique, never-before-seen GLSL shader from scratch for this niche.` 
          }
        ],
        temperature: 0.9,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });
      aiData = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Basic validation: Check if it actually wrote GLSL
      if(aiData.glsl && aiData.glsl.includes("void main")) {
         break; 
      } else {
         throw new Error("Invalid GLSL generated");
      }
    } catch (error) {
      console.warn(`⚠️ Model failed to write valid GLSL. Shifting to next...`);
    }
  }

  if(!aiData || !aiData.glsl) {
      console.error("❌ All models failed to generate raw code.");
      process.exit(1);
  }

  // 🧬 DECOUPLED ARCHITECTURE: We hardcode the TV (React wrapper), but the AI provides the Channel (Raw GLSL Math)
  const reactCode = `
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export const BawalAsset = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const mount = useRef<HTMLDivElement>(null);
  
  const uniforms = useRef({ 
    u_time: { value: 0 }, 
    u_resolution: { value: new THREE.Vector2(width, height) }
  });

  useEffect(() => {
    if (!mount.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    mount.current.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms.current,
      vertexShader: \`void main() { gl_Position = vec4(position, 1.0); }\`,
      fragmentShader: \`
        uniform float u_time;
        uniform vec2 u_resolution;
        
        // --- 100% UNIQUE AI GENERATED MATHEMATICS ---
        ${aiData.glsl}
      \`
    });
    
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    
    const animate = () => {
      uniforms.current.u_time.value = frame / fps;
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
  
  console.log(`✅ 100% UNIQUE SHADER GENERATED FROM SCRATCH!`);
  console.log(`🎯 RENDER READY ASSET: ${aiData.title}`);
}

generate().catch(console.error);