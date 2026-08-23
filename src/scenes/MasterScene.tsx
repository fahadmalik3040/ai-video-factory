import React, { Suspense } from 'react';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const { customShader, colorTheme, sceneText, bloomIntensity = 1.5, aberration = 0.005 } = data || {};

  return (
    <Suspense fallback={null}>
      {/* LAYER 1: Pure WebGL Generative Shader */}
      <EliteVFX2D customShader={customShader} themeColor={colorTheme} />

      {/* LAYER 2: Pure WebGL 3D Typography (Reacts to Bloom) */}
      {sceneText && (
        <Text position={[0, 0, 1]} anchorX="center" anchorY="middle" color="#ffffff" fontSize={2.5} outlineColor={colorTheme} outlineWidth={0.05}>
          {sceneText}
          <meshBasicMaterial toneMapped={false} />
        </Text>
      )}

      {/* LAYER 3: Cinematic Hollywood Post-Processing */}
      <EffectComposer disableNormalPass>
        <Bloom intensity={bloomIntensity} luminanceSmoothing={0.9} luminanceThreshold={0.2} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(aberration, aberration)} blendFunction={BlendFunction.NORMAL} />
        <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.08} />
      </EffectComposer>
    </Suspense>
  );
};

export default MasterScene;
