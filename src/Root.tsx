import React, { Suspense } from 'react';
import { Composition } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { PerspectiveCamera } from '@react-three/drei';

// Safely try to import the AI generated code. 
// Using require() ensures we don't break the top-level module evaluation.
let AIGeneratedScene: any = null;
try {
  const AIModule = require('./scenes/AIGeneratedScene');
  AIGeneratedScene = AIModule.AIGeneratedScene || AIModule.default || Object.values(AIModule).find((val: any) => typeof val === 'function');
} catch (error) {
  console.error("⚠️ Could not load AI file:", error);
}

// This wrapper is DEFINED IN THIS FILE, so it can NEVER be undefined.
const BulletproofWrapper: React.FC = () => {
  if (!AIGeneratedScene) {
    return (
      <div style={{ backgroundColor: 'red', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '80px' }}>AI COMPONENT FAILED TO LOAD</h1>
      </div>
    );
  }

  const SafeComp = AIGeneratedScene as React.FC;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ThreeCanvas width={3840} height={2160}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <SafeComp />
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={BulletproofWrapper} // Guaranteed to NOT be undefined
      durationInFrames={900}
      fps={30}
      width={3840}
      height={2160}
    />
  );
};

export default RemotionRoot;
