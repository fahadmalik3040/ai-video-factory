import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from './MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

export interface Main3DProps {
  sceneData?: any;
  customShader?: string;
  colorTheme?: string;
  sceneText?: string;
  bloomIntensity?: number;
  aberration?: number;
  prompt?: string;
  clipCategory?: string;
  [key: string]: any;
}

export const Main3D: React.FC<Main3DProps> = (props) => {
  const dynamicData = props.sceneData || props;
  const { sceneText, colorTheme = "#00f0ff", bloomIntensity = 1.5, clipCategory, theme } = dynamicData || {};

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={clipCategory || theme || "default"} />
      </ErrorBoundary>
      
      {/* LAYER 1: 100% Crash-Proof Pure WebGL Canvas */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
            gl={{
              antialias: false,
              powerPreference: "low-power",
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: true,
            }}
          >
            <MasterScene data={dynamicData} />
          </ThreeCanvas>
        </ErrorBoundary>
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

export default Main3D;
