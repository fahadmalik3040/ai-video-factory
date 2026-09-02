import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs-extra";

const run = async () => {
  const outDir = path.resolve("out");
  fs.emptyDirSync(outDir);

  const jsonPath = path.resolve("src/data/videoConfig.json");
  const jsonData = fs.existsSync(jsonPath) ? fs.readJsonSync(jsonPath) : { glsl: "void main() { gl_FragColor = vec4(0.0); }" };

  console.log("🧨 BYPASSING TEMPLATE: Compiling Raw GLSL Shader directly to Canvas...");

  // 🔥 Dynamically build a pure WebGL component to bypass old template completely
  const shaderComponentCode = `
import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export const PureShader = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const mount = useRef(null);
  const uniforms = useRef({ u_time: { value: 0 }, u_resolution: { value: new THREE.Vector2(width, height) } });

  useEffect(() => {
    if (!mount.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    mount.current.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms.current,
      fragmentShader: \`${jsonData.glsl.replace(/`/g, "\\`")}\`,
      vertexShader: \`void main() { gl_Position = vec4(position, 1.0); }\`
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
  
  fs.writeFileSync(path.resolve("src/PureShader.tsx"), shaderComponentCode);
  
  // Create a dynamic entry point for Remotion
  const dynamicEntryCode = `
import { registerRoot, Composition } from 'remotion';
import { PureShader } from './PureShader';

const RemotionRoot = () => (
  <Composition id="UltimateShaderMaster" component={PureShader} durationInFrames={300} fps={30} width={3840} height={2160} />
);
registerRoot(RemotionRoot);
  `;
  fs.writeFileSync(path.resolve("src/dynamic_entry.tsx"), dynamicEntryCode);

  console.log("📦 Bundling Raw Shader Pipeline...");
  const bundled = await bundle({ entryPoint: path.resolve("./src/dynamic_entry.tsx"), webpackOverride: (config) => config });

  const chromiumOptions = {
    gl: "angle",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", 
      "--use-gl=angle", "--use-angle=swiftshader", "--disable-features=Vulkan", "--enable-webgl"
    ]
  };

  const comps = await getCompositions(bundled, { chromiumOptions });

  console.log(`🎯 RENDERING SHADER MATHEMATICS (Cinematic 4K)...`);
  await renderMedia({
    composition: comps[0], serveUrl: bundled, codec: "h264", bitrate: "80M", concurrency: 1,
    outputLocation: path.join(outDir, "final_adobe_stock_master.mp4"), chromiumOptions
  });

  const metadataContent = `TITLE:\n${jsonData.title || "4K Abstract"}\n\nTAGS:\n${(jsonData.seoTags || []).join(", ")}\n`;
  fs.writeFileSync(path.join(outDir, "metadata.txt"), metadataContent);
  console.log("✅ 100% Unique GLSL Render Complete! Ready for Adobe Stock.");
};

run().catch((err) => {
  console.error("❌ Render Error:", err);
  process.exit(1);
});
