import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { PerspectiveCamera } from '@react-three/drei';
// Import everything from the AI generated file
import * as AIModule from '../scenes/AIGeneratedScene';

// WILDCARD SCANNER: Try exact name, then default export, then ANY exported function.
// Fallback to a red box if the AI completely failed to export a component.
const TargetComponent = (AIModule as any).AIGeneratedScene 
  || (AIModule as any).default 
  || Object.values(AIModule).find(val => typeof val === 'function') 
  || (() => <mesh><boxGeometry args={[10,10,10]}/><meshBasicMaterial color="red" wireframe/></mesh>);

export const SceneRouter = () => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ThreeCanvas width={3840} height={2160}>
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         {/* Fallback universal lighting so we can see the scene even if AI forgot lights */}
         <ambientLight intensity={0.5} />
         <directionalLight position={[10, 10, 10]} intensity={1} />
         
         <TargetComponent />
      </ThreeCanvas>
    </div>
  );
};
