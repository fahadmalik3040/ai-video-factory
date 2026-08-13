import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import ScienceScene from '../scenes/ScienceScene';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ThreeCanvas width={3840} height={2160}>
         <ScienceScene data={sceneData} />
      </ThreeCanvas>
    </div>
  );
};
