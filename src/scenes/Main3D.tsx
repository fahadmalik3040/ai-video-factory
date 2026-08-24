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
  clipCategory?: "sci_fi_3d_tunnels" | "liquid_metal_3d_fractals" | "quantum_core_structures" | string;
  colorTheme?: string;
  aiSDFMath?: string;
  [key: string]: any;
}

export const Main3D: React.FC<Main3DProps> = (props) => {
  const dynamicData = props.data || props.job3D || props.sceneData?.job3D || props.sceneData || props;
  const theme = dynamicData?.colorTheme || "#ff0055";
  const category = dynamicData?.clipCategory || "sci_fi_3d_tunnels";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020308', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={category} />
      </ErrorBoundary>
      
      {/* PURE 3D RAYMARCHING SDF CINEMATIC WORLD */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <PremiumParticles3D
              themeColor={theme}
              aiSDFMath={dynamicData?.aiSDFMath}
            />
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main3D;
