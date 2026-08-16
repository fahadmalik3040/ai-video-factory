import { ThreeCanvas } from '@remotion/three';
import { MasterScene } from '../scenes/MasterScene';
import { PerspectiveCamera } from '@react-three/drei';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <div style={{ flex: 1, backgroundColor: '#020202' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      {/* ThreeCanvas with strict 4K dimensions and headless gl config */}
      <ThreeCanvas width={3840} height={2160} gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}>
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         <MasterScene data={sceneData} />
      </ThreeCanvas>
    </div>
  );
};
