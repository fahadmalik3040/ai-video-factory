import React from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const { customShader, colorTheme, sceneText, bloomIntensity = 1.5, aberration = 0.005 } = data || {};

  return (
    <>
      <EliteVFX2D customShader={customShader} themeColor={colorTheme}/>
      {sceneText && (
        <Text position={[0, 0, 1]} anchorX="center" anchorY="middle" color="#ffffff" fontSize={2.5} outlineColor={colorTheme} outlineWidth={0.05}>
          {sceneText}
          <meshBasicMaterial toneMapped={false} />
        </Text>
      )}
      <EffectComposer disableNormalPass>
        <Bloom intensity={bloomIntensity} luminanceSmoothing={0.9} luminanceThreshold={0.2} mipmapBlur/>
        <ChromaticAberration offset={new THREE.Vector2(aberration, aberration)} blendFunction={BlendFunction.NORMAL}/>
        <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.08}/>
      </EffectComposer>
    </>
  );
};

export default MasterScene;
