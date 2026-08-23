import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { AudioEngine } from '../engine/audio/AudioEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';

export interface Main2DProps {
  data?: any;
  sceneData?: any;
  job2D?: any;
  trendTopic?: string;
  clipCategory?: "cyberpunk_hud" | "cinematic_light_leak" | "vhs_glitch" | "fluid_overlay";
  colorTheme?: string;
  customShader?: string;
  bloomIntensity?: number;
  [key: string]: any;
}

export const Main2D: React.FC<Main2DProps> = (props) => {
  const dynamicData = props.data || props.job2D || props.sceneData?.job2D || props.sceneData || props;
  const theme = dynamicData?.colorTheme || "#ff0055";
  const category = dynamicData?.clipCategory || "fluid_overlay";

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <ErrorBoundary>
        <AudioEngine category={category} />
      </ErrorBoundary>
      
      {/* PURE 2D FULLSCREEN WEBPACK GLSL SHADER */}
      <AbsoluteFill>
        <ErrorBoundary>
          <ThreeCanvas 
            width={3840} 
            height={2160} 
            style={{ width: 3840, height: 2160, position: 'absolute' }}
            camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
            gl={{
              antialias: false,
              powerPreference: "low-power",
              preserveDrawingBuffer: true,
            }}
          >
            <EliteVFX2D
              customShader={dynamicData?.customShader}
              themeColor={theme}
              bloomIntensity={dynamicData?.bloomIntensity || 1.5}
            />
          </ThreeCanvas>
        </ErrorBoundary>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Main2D;
