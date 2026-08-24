import React from 'react';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';

export const MasterScene = ({ data }: any) => {
  const is3D = data?.job3D || data?.clipCategory?.includes('tunnel') || data?.clipCategory?.includes('fractal') || data?.clipCategory?.includes('structure') || data?.clipCategory?.includes('3d');
  if (is3D) {
    const jobData = data?.job3D || data;
    return (
      <PremiumParticles3D
        themeColor={jobData?.colorTheme}
        aiSDFMath={jobData?.aiSDFMath}
      />
    );
  }

  const jobData = data?.job2D || data;
  return (
    <EliteVFX2D
      aiGLSLCode={jobData?.aiGLSLCode || jobData?.customShader || jobData?.aiSDFMath}
      themeColor={jobData?.colorTheme}
    />
  );
};

export default MasterScene;
