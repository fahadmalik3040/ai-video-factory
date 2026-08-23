import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { MasterScene } from '../scenes/MasterScene';
import { PerspectiveCamera } from '@react-three/drei';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from './ErrorBoundary';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ErrorBoundary>
        <AudioEngine category={sceneData?.theme || "default"} />
      </ErrorBoundary>
      <ErrorBoundary>
        <ThreeCanvas 
          width={3840} 
          height={2160}
          gl={{
            antialias: false,
            powerPreference: "low-power",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: true
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
          <MasterScene data={sceneData} />
        </ThreeCanvas>
      </ErrorBoundary>
    </div>
  );
};

export default SceneRouter;
