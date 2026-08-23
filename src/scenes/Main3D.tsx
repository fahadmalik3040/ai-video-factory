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
  const theme = dynamicData?.colorTheme || dynamicData?.theme || "default";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020308', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={theme} />
      </ErrorBoundary>
      
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
  );
};

export default Main3D;
