import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export interface Main3DProps {
  data?: any;
  sceneData?: any;
  job3D?: any;
  trendTopic?: string;
  clipCategory?: string;
  colorTheme?: string;
  particleCount?: number;
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
      
      {/* 3D PREMIUM PARTICLES SCENE */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 100 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <PremiumParticles3D
              themeColor={theme}
              particleCount={dynamicData?.particleCount || 25000}
            />
            <EffectComposer disableNormalPass multisampling={8}>
              <Bloom intensity={2.5} luminanceSmoothing={0.9} luminanceThreshold={0.1} mipmapBlur />
              <Vignette darkness={1.1} eskil={false} offset={0.1} />
            </EffectComposer>
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main3D;
