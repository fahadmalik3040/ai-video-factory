import React, { Suspense } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { PerspectiveCamera } from '@react-three/drei';
import { MasterScene3D } from '../scenes/MasterScene3D';
import { MasterScene2D } from '../scenes/MasterScene2D';

export const SceneRouter = ({ sceneData, data }: any) => {
  const payload = sceneData || data || {};
  if (payload.engine === "2D" || payload.layout) {
    return <MasterScene2D data={payload} />;
  }
  
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: '#050505', overflow: 'hidden' }}>
      <ThreeCanvas 
        width={3840} 
        height={2160}
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
          <MasterScene3D data={payload} />
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};
