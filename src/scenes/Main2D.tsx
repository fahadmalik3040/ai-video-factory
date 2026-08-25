import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export interface Main2DProps {
  data?: any;
  sceneData?: any;
  job2D?: any;
  trendTopic?: string;
  clipCategory?: string;
  colorTheme?: string;
  [key: string]: any;
}

export const Main2D: React.FC<Main2DProps> = (props) => {
  const dynamicData = props.data || props.job2D || props.sceneData?.job2D || props.sceneData || props;
  const theme = dynamicData?.colorTheme || "#00ffcc";
  const category = dynamicData?.clipCategory || "liquid_gradient_waves";

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={category} />
      </ErrorBoundary>
      
      {/* PURE 2D FULLSCREEN GLSL SHADER */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
            gl={{
              antialias: false,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
            }}
          >
            <EliteVFX2D
              themeColor={theme}
            />
            <EffectComposer disableNormalPass multisampling={8}>
              <Bloom intensity={2.0} luminanceSmoothing={0.9} luminanceThreshold={0.1} mipmapBlur />
              <Vignette darkness={1.1} eskil={false} offset={0.1} />
            </EffectComposer>
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main2D;
