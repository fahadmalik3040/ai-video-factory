import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { MasterScene } from '../scenes/MasterScene';
import { PerspectiveCamera } from '@react-three/drei';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ThreeCanvas width={3840} height={2160}>
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         <MasterScene data={sceneData} />
      </ThreeCanvas>
    </div>
  );
};
