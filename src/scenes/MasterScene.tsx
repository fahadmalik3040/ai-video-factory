import React from 'react';
import { PremiumParticles3D } from '../engine/3d/PremiumParticles3D';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';

export const MasterScene = ({ data }: any) => {
  const is3D = data?.job3D || data?.particleCount !== undefined || data?.cameraMotion !== undefined;
  if (is3D) {
    const jobData = data?.job3D || data;
    return (
      <PremiumParticles3D
        trendTopic={jobData?.trendTopic}
        clipCategory={jobData?.clipCategory}
        colorTheme={jobData?.colorTheme}
        particleCount={jobData?.particleCount}
        cameraMotion={jobData?.cameraMotion}
      />
    );
  }

  const jobData = data?.job2D || data;
  return (
    <EliteVFX2D
      customShader={jobData?.customShader}
      themeColor={jobData?.colorTheme}
      bloomIntensity={jobData?.bloomIntensity}
    />
  );
};

export default MasterScene;
