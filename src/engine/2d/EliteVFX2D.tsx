import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fallbackShader = `
  uniform float time;
  uniform vec3 colorTheme;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float glow = 0.05 / (length(p) + 0.01);
    gl_FragColor = vec4(colorTheme * glow, 1.0);
  }
`;

export const EliteVFX2D = ({ themeColor, customShader, bloomIntensity, aberration }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Safely fallback if AI writes invalid GLSL
  const finalFragmentShader = (typeof customShader === 'string' && customShader.includes('void main')) 
    ? customShader 
    : fallbackShader;

  const uniforms = useMemo(() => {
    // CRITICAL FIX: Safe color parsing to prevent Three.js fatal crash
    let safeColor = new THREE.Color("#00ffcc"); 
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch (e) {
      console.warn("Invalid AI color, using fallback.");
    }

    return {
      time: { value: 0 },
      colorTheme: { value: safeColor },
      resolution: { value: new THREE.Vector2(3840, 2160) },
      bloomIntensity: { value: typeof bloomIntensity === 'number' ? bloomIntensity : 1.5 },
      aberration: { value: typeof aberration === 'number' ? aberration : 0.005 }
    };
  }, [themeColor, bloomIntensity, aberration]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
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
