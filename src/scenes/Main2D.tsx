import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

export interface Main2DProps {
  data?: any;
  sceneData?: any;
  job2D?: any;
  trendTopic?: string;
  clipCategory?: string;
  colorTheme?: string;
  customShader?: string;
  [key: string]: any;
}

export const Main2D: React.FC<Main2DProps> = (props) => {
  const dynamicData = props.data || props.job2D || props.sceneData?.job2D || props.sceneData || props;
  const theme = dynamicData?.colorTheme || "#00f0ff";
  const category = dynamicData?.clipCategory || "fluid_caustics";

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={category} />
      </ErrorBoundary>
      
      {/* PURE 2D FULLSCREEN WEBPACK GLSL SHADER */}
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
              preserveDrawingBuffer: true,
            }}
          >
            <EliteVFX2D
              customShader={dynamicData?.customShader}
              themeColor={theme}
            />
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main2D;
