import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from '../scenes/MasterScene';
import { PerspectiveCamera } from '@react-three/drei';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020202' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}
      >
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         <MasterScene data={sceneData} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
