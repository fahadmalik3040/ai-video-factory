import { ThreeCanvas } from '@remotion/three';
import React, { Suspense } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

// Ultimate Safe Dynamic Import to catch AI Hallucinations
const LazyScene = React.lazy(() => 
  import('../scenes/AIGeneratedScene')
    .then((module: any) => {
      const Comp = module.AIGeneratedScene || module.default || Object.values(module).find(val => typeof val === 'function');
      if (!Comp) throw new Error("AI failed to export a component");
      return { default: Comp };
    })
    .catch((err) => {
      console.error("⚠️ AI Scene Evaluation Error Caught:", err);
      return { 
        default: () => (
          <mesh>
            <boxGeometry args={[10, 10, 10]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        )
      };
    })
);

export const SceneRouter = () => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#050505' }}>
      <ThreeCanvas width={3840} height={2160}>
         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
         <ambientLight intensity={0.5} />
         <directionalLight position={[10, 10, 10]} intensity={1.5} />
         <Suspense fallback={null}>
           <LazyScene />
         </Suspense>
      </ThreeCanvas>
    </div>
  );
};
