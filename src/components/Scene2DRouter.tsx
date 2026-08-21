import { AbsoluteFill } from 'remotion';
import { Scene2D } from '../scenes/Scene2D';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const Scene2DRouter = ({ sceneData }: any) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070f', overflow: 'hidden' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      <Scene2D data={sceneData} />
    </AbsoluteFill>
  );
};

export default Scene2DRouter;
