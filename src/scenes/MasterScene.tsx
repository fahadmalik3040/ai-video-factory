import React, { Suspense } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Premium3D } from '../engine/3d/Premium3D';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export const MasterScene = ({ data, renderType = "3d" }: any) => {
  const { colorTheme } = data || { colorTheme: "#ff0055" };
  const is3D = renderType === "3d";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202' }}>
      {/* 4K CANVAS WITH PROPER CAMERA TO PREVENT BLACK SCREENS */}
      <ThreeCanvas width={3840} height={2160} camera={{ position: [0, 0, 18], fov: 45 }}>
        <Suspense fallback={null}>
          
          {is3D ? <Premium3D themeColor={colorTheme} /> : <EliteVFX2D themeColor={colorTheme} />}
          
          {/* HOLLYWOOD GLOW POST-PROCESSING */}
          <EffectComposer disableNormalPass multisampling={8}>
            <Bloom intensity={2.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
            <Vignette darkness={1.2} offset={0.1} />
          </EffectComposer>

        </Suspense>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
