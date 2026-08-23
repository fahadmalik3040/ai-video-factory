import React from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';

export const MasterScene = ({ data }: any) => {
  const { shaderType, colorTheme, bloomIntensity = 1.5, speed = 1.0 } = data || {};
  return (
    <EliteVFX2D 
      shaderType={shaderType} 
      themeColor={colorTheme} 
      bloomIntensity={bloomIntensity}
      speed={speed}
    />
  );
};

export default MasterScene;
