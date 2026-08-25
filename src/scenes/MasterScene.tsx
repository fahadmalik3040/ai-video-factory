import React, { Suspense } from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export const MasterScene = ({ data, renderType = "3d" }: any) => {
  const dynamicData = data?.job3D || data?.job2D || data;
  const is3D = renderType === "3d" || dynamicData?.particleCount !== undefined || data?.job3D;
  const colorTheme = dynamicData?.colorTheme || "#00ffcc";
  const particleCount = dynamicData?.particleCount || 25000;
  
  return (
    <Suspense fallback={null}>
      {is3D ? (
        <PremiumParticles3D particleCount={particleCount} themeColor={colorTheme} />
      ) : (
        <EliteVFX2D themeColor={colorTheme} />
      )}
      
      <EffectComposer disableNormalPass multisampling={8}>
        <Bloom intensity={2.5} luminanceSmoothing={0.9} luminanceThreshold={0.1} mipmapBlur />
        <Vignette darkness={1.1} eskil={false} offset={0.1} />
      </EffectComposer>
    </Suspense>
  );
};

export default MasterScene;
