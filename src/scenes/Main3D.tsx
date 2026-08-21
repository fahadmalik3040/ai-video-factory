import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from './MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export interface Main3DProps {
  sceneData?: any;
  engine3D?: any;
  seoPackage?: any;
  renderModes?: string[];
  colors?: string[];
  theme?: string;
  [key: string]: any;
}

export const Main3D: React.FC<Main3DProps> = (props) => {
  // Extract scene data dynamically from inputProps with zero static caching
  const dynamicData = props.sceneData || props;
  const theme = dynamicData?.theme || props?.theme || "default";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202', overflow: 'hidden' }}>
      <AudioEngine category={theme} />
      
      {/* 100% Visual Stock Video Engine: Dynamic PBR WebGL with Safe Framing */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 32], fov: 45, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
      >
         <MasterScene data={dynamicData} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export default Main3D;
