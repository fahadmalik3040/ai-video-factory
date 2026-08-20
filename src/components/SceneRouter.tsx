import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from '../scenes/MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020202', overflow: 'hidden' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      
      {/* 100% Visual Stock Video Engine: Native WebGL, High Performance, Zero Text Overlays */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 25], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}
      >
         <MasterScene data={sceneData} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
