import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from './MasterScene';
import { GLSLVfxCategory } from '../scripts/generate_3d_swarm';

export interface Main2DProps {
  vfxCategory?: GLSLVfxCategory;
  glslFragmentShader?: string;
  uniforms?: {
    color1?: string;
    color2?: string;
    speed?: number;
    density?: number;
  };
  colors?: string[];
  [key: string]: any;
}

export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const dynamicData = props?.sceneData || props?.data || props;

  return (
    <AbsoluteFill style={{ backgroundColor: '#020308', overflow: 'hidden' }}>
      <ThreeCanvas
        width={3840}
        height={2160}
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
      >
        <MasterScene data={dynamicData} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export default Main2D;
