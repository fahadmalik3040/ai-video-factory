import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { MasterScene } from '../scenes/MasterScene';
import { AudioEngine } from '../engine/audio/AudioEngine';

export const SceneRouter = ({ sceneData }: any) => {
  const title = sceneData?.title || "TRENDING NOW";
  const glowColor = sceneData?.lighting?.colorTheme || "#00ffff";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202', overflow: 'hidden' }}>
      <AudioEngine category={sceneData?.theme || "default"} />
      
      {/* HEAVY ENGINE: Native WebGL, strict sizing, no Drei camera layout clashes */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 25], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}
      >
         <MasterScene data={sceneData} />
      </ThreeCanvas>

      {/* HEAVY HTML TEXT OVERLAY: Cinematic, perfectly immune to WebGL layout bugs */}
      <AbsoluteFill style={{
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 180,
        fontWeight: 900,
        fontFamily: 'system-ui, sans-serif',
        textShadow: `0 0 80px ${glowColor}, 0 0 30px ${glowColor}, 0 0 10px #ffffff`,
        textAlign: 'center',
        textTransform: 'uppercase',
        zIndex: 10,
        padding: '10%'
      }}>
        {title}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
