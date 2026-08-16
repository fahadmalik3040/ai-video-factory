import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from '../scenes/MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  const title = sceneData?.title || "TRENDING NOW";
  const glowColor = sceneData?.lighting?.colorTheme || "#00ffff";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        camera={{ position: [0, 0, 20], fov: 50 }} 
        style={{ position: 'absolute', top: 0, left: 0 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}
      >
         <MasterScene data={sceneData} />
      </ThreeCanvas>

      <AbsoluteFill style={{
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 160,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        textShadow: `0 0 60px ${glowColor}, 0 0 20px ${glowColor}`,
        textAlign: 'center',
        textTransform: 'uppercase',
        zIndex: 10,
        padding: '200px'
      }}>
        {title}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
