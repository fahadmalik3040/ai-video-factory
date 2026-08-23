import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

export interface Main3DProps {
  data?: any;
  sceneData?: any;
  job3D?: any;
  trendTopic?: string;
  clipCategory?: "cinematic_particles" | "procedural_geometry" | "raymarched_core" | "abstract_wireframe";
  colorTheme?: string;
  particleCount?: number;
  cameraMotion?: string;
  [key: string]: any;
}

export const Main3D: React.FC<Main3DProps> = (props) => {
  const dynamicData = props.data || props.job3D || props.sceneData?.job3D || props.sceneData || props;
  const theme = dynamicData?.colorTheme || "#00f0ff";
  const category = dynamicData?.clipCategory || "cinematic_particles";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020308', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={category} />
      </ErrorBoundary>
      
      {/* PURE 3D THREE.JS PROCEDURAL WORLD */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <PremiumParticles3D
              trendTopic={dynamicData?.trendTopic}
              clipCategory={category}
              colorTheme={theme}
              particleCount={dynamicData?.particleCount || 5000}
              cameraMotion={dynamicData?.cameraMotion || "orbit_slow"}
            />
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main3D;
