import { ThreeCanvas } from '@remotion/three';
import { MasterScene } from '../scenes/MasterScene';

export const SceneRouter = ({ sceneData }: any) => {
  return (
    <ThreeCanvas width={3840} height={2160}>
       <ambientLight intensity={1} />
       <directionalLight position={[10, 10, 5]} intensity={2} />
       <MasterScene data={sceneData} />
    </ThreeCanvas>
  );
};
