import React from 'react';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';

export const MasterScene = ({ data }: any) => {
  const is3D = data?.job3D || data?.particleCount !== undefined || data?.clipCategory?.includes('galaxy') || data?.clipCategory?.includes('core') || data?.clipCategory?.includes('matrix');
  if (is3D) {
    const jobData = data?.job3D || data;
    return (
      <PremiumParticles3D
        themeColor={jobData?.colorTheme}
        particleCount={jobData?.particleCount || 18000}
      />
    );
  }

  const jobData = data?.job2D || data;
  return (
    <EliteVFX2D
      customShader={jobData?.customShader}
      themeColor={jobData?.colorTheme}
    />
  );
};

export default MasterScene;
