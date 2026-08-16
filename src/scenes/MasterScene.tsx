import { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.Mesh>(null);
  const color = data?.lighting?.colorTheme || "#00ffff";

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = frame * 0.02;
      meshRef.current.rotation.x = frame * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} scale={3}>
      <torusKnotGeometry args={[10, 3, 100, 16]} />
      <meshStandardMaterial color="#111111" emissive={color} emissiveIntensity={2} wireframe={true} />
    </mesh>
  );
};
