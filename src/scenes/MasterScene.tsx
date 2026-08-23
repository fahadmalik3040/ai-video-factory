import React from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';

export const MasterScene = ({ data }: any) => {
  const { customShader, colorTheme, bloomIntensity = 1.5, aberration = 0.005 } = data || {};
  return (
    <EliteVFX2D 
      customShader={customShader} 
      themeColor={colorTheme} 
      bloomIntensity={bloomIntensity}
      aberration={aberration}
    />
  );
};

export default MasterScene;
