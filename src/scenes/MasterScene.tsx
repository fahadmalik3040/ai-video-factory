import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { Grid, Box, Torus, Sphere, Icosahedron, Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generates random points for a particle field
const particleCount = 1000;
const positions = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i++) { positions[i] = (Math.random() - 0.5) * 40; }

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const color = data.lighting?.colorTheme || "#00ffcc";
  const category = data.theme || "technology";

  return (
    <group>
      {/* Universal Ambient & Particles */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={data.lighting?.keyIntensity || 1} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color={color} transparent opacity={0.6} />
      </points>

      {/* DYNAMIC STRUCTURE BASED ON CATEGORY */}
      {category === "technology" && (
        <group rotation={[frame * 0.005, frame * 0.005, 0]}>
          <Grid args={[20, 20]} cellColor={color} sectionColor={color} sectionThickness={2} />
          <Box args={[3, 3, 3]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={1} wireframe />
          </Box>
        </group>
      )}

      {category === "finance" && (
        <group position={[0, -5, 0]}>
           {/* Procedural Data Bars */}
           {[...Array(10)].map((_, i) => (
             <Box key={i} args={[1, (i+1) + Math.sin(frame*0.05 + i)*2, 1]} position={[i*2 - 10, 0, 0]}>
               <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
             </Box>
           ))}
        </group>
      )}

      {category === "science" && (
        <group rotation={[frame * 0.01, frame * 0.02, 0]}>
          <Icosahedron args={[3, 1]} wireframe>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </Icosahedron>
          <Torus args={[5, 0.1, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color={color} emissive={color} />
          </Torus>
          <Torus args={[6, 0.05, 16, 100]} rotation={[0, Math.PI/2, 0]}>
             <meshStandardMaterial color={color} emissive={color} />
          </Torus>
        </group>
      )}

      {category === "cyber" && (
        <group rotation={[0, frame * 0.02, 0]}>
           <Sphere args={[4, 32, 32]}>
             <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={1.5} wireframe />
           </Sphere>
        </group>
      )}
    </group>
  );
};
