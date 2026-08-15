import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, MeshTransmissionMaterial, Float, Environment, Sparkles, Icosahedron } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<THREE.Group>(null);
  
  const rawColor = data?.lighting?.colorTheme;
  const isHex = typeof rawColor === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(rawColor);
  const colorTheme = isHex ? rawColor : "#00ffff";
  const title = data?.title || "FUTURE A.I.";

  useFrame(() => {
    if (groupRef.current) {
      // Slow cinematic camera pan effect
      groupRef.current.rotation.y = Math.sin(frame * 0.002) * 0.5;
      groupRef.current.rotation.x = Math.cos(frame * 0.002) * 0.2;
    }
  });

  return (
    <>
      {/* 1. REAL-WORLD LIGHTING & REFLECTIONS */}
      <color attach="background" args={['#010105']} />
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={colorTheme} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0055" />

      <group ref={groupRef}>
        {/* 2. THE HERO TEXT (REAL GLASS / TRANSMISSION) */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
          <Text
            position={[0, 0, 0]}
            fontSize={3}
            letterSpacing={0.1}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {title.toUpperCase()}
            {/* The absolute peak of WebGL materials: Refractive Glass */}
            <MeshTransmissionMaterial 
              backside 
              thickness={1.5} 
              roughness={0.05} 
              transmission={1} 
              ior={1.5} 
              chromaticAberration={0.05} 
              anisotropy={0.1} 
              color="#ffffff" 
            />
          </Text>
        </Float>

        {/* 3. ABSTRACT GEOMETRY (FLOATING ORBS) */}
        <Float speed={2} rotationIntensity={2} floatIntensity={3}>
          <Icosahedron args={[1.5, 0]} position={[5, -2, -3]}>
             <meshStandardMaterial color={colorTheme} emissive={colorTheme} emissiveIntensity={2} wireframe />
          </Icosahedron>
        </Float>
        <Float speed={1.2} rotationIntensity={1} floatIntensity={2}>
          <Icosahedron args={[2, 0]} position={[-6, 3, -5]}>
             <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.5} wireframe />
          </Icosahedron>
        </Float>

        {/* 4. PREMIUM GPU PARTICLES */}
        <Sparkles count={3000} scale={25} size={2} speed={0.4} opacity={0.6} color={colorTheme} />
      </group>

      {/* 5. HOLLYWOOD-LEVEL POST-PROCESSING PIPELINE */}
      <EffectComposer disableNormalPass multisampling={4}>
        {/* Depth of Field (Bokeh): Makes foreground sharp, background blurry */}
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={5} height={480} />
        {/* High-end Bloom for glowing emissive materials */}
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.7} />
        {/* Cinematic Film Grain & Vignette */}
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
