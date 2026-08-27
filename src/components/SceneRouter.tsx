import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { MasterScene } from '../scenes/MasterScene';
import { PerspectiveCamera } from '@react-three/drei';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  const title = sceneData?.title || "TRENDING NOW";
  const colorTheme = sceneData?.lighting?.colorTheme || "#00ffcc";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202' }}>
      <AudioEngine category={sceneData?.theme || "default"} />

      {/* LAYER 1: PURE 3D WEBGL BACKGROUND (No text, no layout crashes, pure VFX) */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
      >
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         <MasterScene data={sceneData} />
      </ThreeCanvas>

      {/* LAYER 2: 4K HTML TYPOGRAPHY (100% Crash-Proof, Ultra-Sharp) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{
          fontSize: 180,
          fontWeight: 900,
          color: '#ffffff',
          textShadow: `0 0 40px ${colorTheme}, 0 0 80px ${colorTheme}, 0 0 150px ${colorTheme}`,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '15px',
          width: '80%',
          zIndex: 10
        }}>
          {title}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
