import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';

export interface PremiumParticles3DProps {
  trendTopic?: string;
  clipCategory?: "cinematic_particles" | "procedural_geometry" | "raymarched_core" | "abstract_wireframe";
  colorTheme?: string;
  particleCount?: number;
  cameraMotion?: string;
  [key: string]: any;
}

export const PremiumParticles3D: React.FC<PremiumParticles3DProps> = ({
  trendTopic = "Quantum Energy Field",
  clipCategory = "cinematic_particles",
  colorTheme = "#00f0ff",
  particleCount = 5000,
  cameraMotion = "orbit_slow"
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();

  const color = useMemo(() => {
    try {
      if (typeof colorTheme === 'string' && colorTheme.startsWith('#')) {
        return new THREE.Color(colorTheme);
      }
      return new THREE.Color("#00f0ff");
    } catch {
      return new THREE.Color("#00f0ff");
    }
  }, [colorTheme]);

  const count = Math.min(Math.max(particleCount || 3000, 1000), 10000);

  // Generate 3D Particle Cloud
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const c1 = color;
    const c2 = new THREE.Color(color).offsetHSL(0.15, 0, 0.2);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2.0 + Math.random() * 6.0;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random());
      cols[i * 3] = mixed.r;
      cols[i * 3 + 1] = mixed.g;
      cols[i * 3 + 2] = mixed.b;
    }
    return [pos, cols];
  }, [count, color]);

  useFrame((state) => {
    const t = typeof frame === 'number' && !isNaN(frame) ? frame / 30.0 : state.clock.elapsedTime;
    
    if (groupRef.current) {
      if (cameraMotion.includes("orbit")) {
        groupRef.current.rotation.y = t * 0.25;
        groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.2;
      } else {
        groupRef.current.rotation.y = t * 0.4;
        groupRef.current.rotation.z = Math.cos(t * 0.2) * 0.15;
      }
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = -t * 0.1;
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.5;
      meshRef.current.rotation.y = t * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic 3D Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Procedural Core Geometry based on clipCategory */}
      {(clipCategory === "procedural_geometry" || clipCategory === "raymarched_core") && (
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1.8, 0.45, 128, 32, 2, 3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            wireframe={clipCategory === "procedural_geometry"}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}

      {clipCategory === "abstract_wireframe" && (
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2.5, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>
      )}

      {/* Ambient and point lights for 3D depth */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={color} />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ffffff" />
    </group>
  );
};

export default PremiumParticles3D;
