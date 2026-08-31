import React, { useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

export const MasterScene3D = ({ data }: any) => {
  const frame = useCurrentFrame();
  
  const primaryColor = data?.environment?.primaryColor || "#00ffcc";
  const secondaryColor = data?.environment?.secondaryColor || "#ff0055";
  const shape = data?.mainGeometry?.shape || "quantum_rings";
  const isWireframe = data?.mainGeometry?.wireframe ?? true;
  const rotationSpeed = data?.mainGeometry?.rotationSpeed || 0.02;
  const particleCount = Math.min(data?.vfx?.particleCount || 5000, 10000);

  const heroRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  // Background Particle Positions
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 80;
      pos[i + 1] = (Math.random() - 0.5) * 80;
      pos[i + 2] = (Math.random() - 0.5) * 80;
    }
    return [pos];
  }, [particleCount]);

  useFrame(() => {
    if (heroRef.current) {
      heroRef.current.rotation.y = frame * rotationSpeed;
      heroRef.current.rotation.x = Math.sin(frame * 0.02) * 0.4;
    }
    if (ringRef1.current) ringRef1.current.rotation.z = frame * 0.03;
    if (ringRef2.current) ringRef2.current.rotation.x = -frame * 0.025;
    if (ringRef3.current) ringRef3.current.rotation.y = frame * 0.035;
  });

  return (
    <group>
      {/* Dynamic Procedural Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 20, 15]} intensity={3} color={primaryColor} />
      <pointLight position={[-10, -15, -10]} intensity={2.5} color={secondaryColor} />

      {/* Cyber Grid Floor */}
      <Grid 
        position={[0, -12, 0]} 
        args={[200, 200]} 
        cellColor={primaryColor} 
        sectionColor={secondaryColor} 
        sectionThickness={1.5} 
        fadeDistance={80} 
      />

      {/* Ambient Particle Nebula */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particleCount} 
            array={positions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.18} 
          color={primaryColor} 
          transparent 
          opacity={0.7} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </points>

      {/* Pure 3D Hero Procedural Geometry */}
      <group ref={heroRef} position={[0, 0, 0]}>
        {shape === "quantum_rings" && (
          <group>
            <mesh ref={ringRef1}>
              <torusGeometry args={[8, 0.25, 32, 100]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={1.8} wireframe={isWireframe} />
            </mesh>
            <mesh ref={ringRef2}>
              <torusGeometry args={[6, 0.2, 32, 100]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={1.5} wireframe={isWireframe} />
            </mesh>
            <mesh ref={ringRef3}>
              <torusGeometry args={[4, 0.18, 32, 100]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={2.0} wireframe={isWireframe} />
            </mesh>
            <mesh>
              <sphereGeometry args={[2, 32, 32]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2.5} roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        )}

        {shape === "data_monolith" && (
          <group>
            <mesh>
              <boxGeometry args={[4, 12, 4]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={1.5} wireframe={isWireframe} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3.2, 11, 3.2]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={2.0} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <octahedronGeometry args={[5, 0]} />
              <meshStandardMaterial color={primaryColor} wireframe={true} />
            </mesh>
          </group>
        )}

        {shape === "fractal_cloud" && (
          <group>
            <mesh>
              <icosahedronGeometry args={[6, 2]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={1.4} wireframe={isWireframe} />
            </mesh>
            <mesh>
              <dodecahedronGeometry args={[4, 1]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={1.8} wireframe={true} />
            </mesh>
            <mesh>
              <sphereGeometry args={[2.5, 32, 32]} />
              <meshStandardMaterial color={primaryColor} emissive={secondaryColor} emissiveIntensity={2.2} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
