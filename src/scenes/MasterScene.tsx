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

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 1.777; // 16:9 fix
    
    // Hollywood Level Organic Fluid Math
    float t = time * 0.4;
    float fluid = sin(p.x * 8.0 + t) * cos(p.y * 8.0 + t);
    fluid += sin(p.y * 6.0 - t * 1.5) * cos(p.x * 6.0 + t * 1.2);
    
    float glow = 0.08 / (length(p) + 0.1);
    
    vec3 baseColor = colorTheme * (abs(fluid) * 0.5 + 0.3);
    vec3 finalColor = baseColor + glow * colorTheme * 1.5;

    // Smooth edge fade
    float alpha = 1.0 - smoothstep(0.6, 2.0, length(p));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const hexColor = data?.lighting?.colorTheme || "#00ffcc";
  const threeColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: threeColor }
  }), [threeColor]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Safe Particle Count for Cloud (10,000)
  const [positions] = useMemo(() => {
    const pos = new Float32Array(10000 * 3);
    for(let i=0; i<10000*3; i++) { pos[i] = (Math.random() - 0.5) * 60; }
    return [pos];
  }, []);

  useFrame(() => {
    if (materialRef.current) materialRef.current.uniforms.time.value = frame * 0.05;
  });

  return (
    <group>
      {/* Background ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={10000} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={hexColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* The Hero Shader Plane */}
      <mesh position={[0, 0, -5]}>
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
