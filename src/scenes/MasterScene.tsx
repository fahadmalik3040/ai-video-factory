import React, { Suspense } from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Text } from '@react-three/drei';

export const MasterScene = ({ data }: any) => {
  const { customShader, colorTheme, sceneText, bloomIntensity = 1.5, aberration = 0.005 } = data || {};

  return (
    <Suspense fallback={null}>
      {/* LAYER 1: Pure WebGL Generative Shader (Handles its own math-based Bloom) */}
      <EliteVFX2D 
        customShader={customShader} 
        themeColor={colorTheme} 
        bloomIntensity={bloomIntensity}
        aberration={aberration}
      />

      {/* LAYER 2: Pure WebGL 3D Typography */}
      {sceneText && (
        <Text position={[0, 0, 1]} anchorX="center" anchorY="middle" color="#ffffff" fontSize={2.5} outlineColor={colorTheme} outlineWidth={0.05}>
          {sceneText}
          <meshBasicMaterial toneMapped={false} />
        </Text>
      )}
    </Suspense>
  );
};

export default MasterScene;
