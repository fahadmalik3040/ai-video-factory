import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PremiumFinance3D = ({ themeColor = "#00ffcc" }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const gridSize = 25;
  const count = gridSize * gridSize;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const bullishGreen = new THREE.Color("#00ffcc");
    const bearishRed = new THREE.Color("#ff0055");
    
    for (let i = 0; i < count; i++) {
      const color = Math.random() > 0.3 ? bullishGreen : bearishRed;
      color.toArray(arr, i * 3);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.5;
    let i = 0;
    
    if (meshRef.current) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const h = Math.abs(Math.sin(x * 0.2 + time) * Math.cos(z * 0.3 + time * 1.2) * 5.0) + (Math.random() * 0.1);
          dummy.position.set((x - gridSize/2) * 1.2, h / 2 - 3, (z - gridSize/2) * 1.2);
          dummy.scale.set(0.8, h + 0.1, 0.8);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.parent!.rotation.y = time * 0.1;
    }
  });

  return (
    <group position={[0, -2, -10]} rotation={[0.4, 0, 0]}>
      <gridHelper args={[100, 100, "#ffffff", themeColor]} position={[0, -3, 0]} material-transparent material-opacity={0.2} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </boxGeometry>
        <meshBasicMaterial vertexColors={true} transparent opacity={0.85} />
      </instancedMesh>
    </group>
  );
};
