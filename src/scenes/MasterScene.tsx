import React, { useRef, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec3 colorTheme;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    
    // Create organic fluid patterns using sin/cos math
    float t = time * 0.5;
    float fluid = sin(p.x * 10.0 + t) * cos(p.y * 10.0 + t);
    fluid += sin(p.y * 8.0 - t * 1.5) * cos(p.x * 8.0 + t * 1.2);
    
    // Add glowing core and vignette
    float glow = 0.05 / (length(p) + 0.1);
    
    // Color mapping
    vec3 baseColor = colorTheme * (fluid * 0.5 + 0.5);
    vec3 finalColor = baseColor + glow * colorTheme * 2.0;

    // Fade edges
    float alpha = 1.0 - smoothstep(0.5, 1.0, length(p));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  
  // Extract hex color from AI generated data or fallback
  const hexColor = data?.lighting?.colorTheme || "#00ffcc";
  const threeColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: threeColor }
  }), [threeColor]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      // Advance shader time based on frame
      materialRef.current.uniforms.time.value = frame * 0.05;
    }
  });

  return (
    <group>
      {/* Background ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={3000} 
            array={new Float32Array(3000 * 3).fill(0).map(() => (Math.random() - 0.5) * 40)} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color={hexColor} transparent opacity={0.4} />
      </points>

      {/* The Hero Shader Plane filling the 4K view */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[60, 40]} />
        <shaderMaterial 
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
