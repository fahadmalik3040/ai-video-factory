import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { MasterScene } from '../scenes/MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  const { sceneText, colorTheme = "#ff0055", bloomIntensity = 1.5 } = sceneData || {};

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <AudioEngine category={sceneData?.clipCategory || "default"} />

      {/* LAYER 1: 100% Crash-Proof Pure WebGL Canvas */}
      <AbsoluteFill>
        <ThreeCanvas 
          width={3840} 
          height={2160}
          gl={{ antialias: false, powerPreference: "low-power", preserveDrawingBuffer: true }}
        >
           <MasterScene data={sceneData} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* LAYER 2: Cinematic After Effects-Style Text Overlay (Zero Web Worker Crash Risk) */}
      {sceneText && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '180px',
            fontWeight: 900,
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            textTransform: 'uppercase',
            margin: 0,
            padding: '0 100px',
            // THIS is the magic that makes it look like WebGL bloom in the final MP4
            mixBlendMode: 'screen',
            textShadow: `0 0 ${20 * bloomIntensity}px ${colorTheme}, 0 0 ${60 * bloomIntensity}px ${colorTheme}, 0 0 ${120 * bloomIntensity}px ${colorTheme}`
          }}>
            {sceneText}
          </h1>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export default SceneRouter;
