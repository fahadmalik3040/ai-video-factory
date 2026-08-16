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
      
      {/* STRICT PIXEL STYLES TO KILL RESIZEOBSERVER LOOPS */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        style={{ 
          width: '3840px', 
          height: '2160px', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          pointerEvents: 'none'
        }}
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, alpha: false }}
      >
         <MasterScene data={sceneData} />
      </ThreeCanvas>

      <AbsoluteFill style={{
        position: 'absolute',
        width: '3840px',
        height: '2160px',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 160,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        textShadow: `0 0 60px ${glowColor}, 0 0 20px ${glowColor}`,
        textAlign: 'center',
        textTransform: 'uppercase',
        zIndex: 10
      }}>
        {title}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
