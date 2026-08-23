import React, { useState, useEffect } from 'react';
import { delayRender, continueRender } from 'remotion';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Text } from '@react-three/drei';

export const MasterScene = ({ data }: any) => {
  const { customShader, colorTheme, sceneText, bloomIntensity = 1.5, aberration = 0.005 } = data || {};
  
  // CRITICAL: Lock Remotion at Frame 0 until WebGL assets are fully compiled
  const [handle] = useState(() => delayRender("Loading WebGL 3D Text"));

  // If there is no text, unlock immediately
  useEffect(() => {
    if (!sceneText) {
      continueRender(handle);
    }
  }, [sceneText, handle]);

  return (
    <>
      {/* LAYER 1: Pure WebGL Generative Shader */}
      <EliteVFX2D 
        customShader={customShader} 
        themeColor={colorTheme} 
        bloomIntensity={bloomIntensity}
        aberration={aberration}
      />

      {/* LAYER 2: Pure WebGL 3D Typography with Remotion Sync */}
      {sceneText && (
        <Text 
          position={[0, 0, 1]} 
          anchorX="center" 
          anchorY="middle" 
          color="#ffffff" 
          fontSize={2.5} 
          outlineColor={colorTheme} 
          outlineWidth={0.05}
          // CRITICAL: Unlock Remotion ONLY when Troika finishes building the text geometry
          onSync={() => continueRender(handle)}
        >
          {sceneText}
          <meshBasicMaterial toneMapped={false} />
        </Text>
      )}
    </>
  );
};

export default MasterScene;
