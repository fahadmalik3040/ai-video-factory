import { useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const pointsRef = useRef<THREE.Points>(null);
  const hexColor = data?.lighting?.colorTheme || "#00ffff";

  const [positions, colors] = useMemo(() => {
    const particleCount = 10000;
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const baseColor = new THREE.Color(hexColor);
    const secColor = new THREE.Color("#ff00ff");

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 80;
      const radius = 15 * Math.pow(t, 0.5);
      pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 4;

      const mix = baseColor.clone().lerp(secColor, Math.random());
      cols[i * 3] = mix.r; cols[i * 3 + 1] = mix.g; cols[i * 3 + 2] = mix.b;
    }
    return [pos, cols];
  }, [hexColor]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = frame * 0.002;
      pointsRef.current.rotation.x = Math.sin(frame * 0.005) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};
