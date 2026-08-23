import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PremiumParticles3D = ({ themeColor = "#ff0055", particleCount = 15000 }: any) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate cinematic glowing orb texture in-memory (Fixes the ugly square blocks)
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const phs = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const r = 12 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      phs[i] = Math.random() * Math.PI * 2;
    }
    return [pos, phs];
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.elapsedTime * 0.2;
      pointsRef.current.rotation.y = time;
      pointsRef.current.rotation.x = Math.sin(time) * 0.2;
    }
  });

  let safeColor = new THREE.Color("#ff0055");
  try {
    if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
      safeColor = new THREE.Color(themeColor);
    }
  } catch (e) {}

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-phase" count={particleCount} array={phases} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color={safeColor} 
        map={particleTexture}
        transparent={true} 
        opacity={0.9} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </points>
  );
};

export default PremiumParticles3D;
