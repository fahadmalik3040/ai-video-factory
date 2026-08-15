import React, { useRef, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { Text, Icosahedron } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const color = data?.lighting?.colorTheme || "#00ffcc";
  const title = data?.title || "TRENDING NOW";

  // Generate a premium particle field
  const [positions] = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    for(let i=0; i<2000*3; i++) { pos[i] = (Math.random() - 0.5) * 60; }
    return [pos];
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = frame * 0.002;
      groupRef.current.rotation.x = Math.sin(frame * 0.005) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={data?.lighting?.keyIntensity || 1.5} />
      
      {/* THE ACTUAL TRENDING TOPIC IN 3D */}
      <Text
        position={[0, 0, 0]}
        fontSize={2.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={30}
        textAlign="center"
        outlineWidth={0.08}
        outlineColor={color}
      >
        {title.toUpperCase()}
      </Text>

      {/* Cinematic Abstract Framing */}
      <Icosahedron args={[14, 2]} wireframe>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.15} />
      </Icosahedron>

      {/* Floating Space Dust / Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2000} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={color} transparent opacity={0.8} />
      </points>
    </group>
  );
};
