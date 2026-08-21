import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from '../scenes/MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020202', overflow: 'hidden' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      
      {/* 100% Visual Stock Video Engine: Safe Camera Framing & Zero Text Overlays */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 32], fov: 45, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
      >
         <MasterScene data={sceneData} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export default SceneRouter;
