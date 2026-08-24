import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EliteVFX2D = ({ themeColor, customShader }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  // Fallback shader if AI hallucinated
  const fallback = `void main() { vec2 p = vUv * 2.0 - 1.0; float glow = 0.05 / (length(p) + 0.01); gl_FragColor = vec4(colorTheme * glow, 1.0); }`;
  let rawShader = (customShader && typeof customShader === 'string' && customShader.includes('void main')) ? customShader : fallback;

  // Prevent duplicate declarations by stripping them if AI included them
  rawShader = rawShader.replace(/uniform float time;/g, '')
                       .replace(/uniform vec3 colorTheme;/g, '')
                       .replace(/varying vec2 vUv;/g, '');

  // Force-inject guaranteed headers
  const finalFragmentShader = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;
    \n${rawShader}
  `;

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={finalFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
