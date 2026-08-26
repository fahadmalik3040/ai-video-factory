import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Premium3D = ({ themeColor = "#00ffcc" }: any) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Optimized for Cloud WebGL Heap limits while maintaining cinematic density
  const particleCount = 15000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    let baseColor = new THREE.Color("#00ffcc");
    try { baseColor = new THREE.Color(themeColor); } catch(e){}
    const accentColor = new THREE.Color("#ffffff");

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 25;
      const angle = radius * 0.5 + Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4 * (25 - radius) / 25;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const mixRatio = Math.random();
      const mixed = baseColor.clone().lerp(accentColor, mixRatio * 0.4);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [particleCount, themeColor]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group rotation={[0.3, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        {/* Native shader-like glow via AdditiveBlending (Crash-proof) */}
        <pointsMaterial size={0.12} vertexColors={true} transparent opacity={0.9} sizeAttenuation={true} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};
