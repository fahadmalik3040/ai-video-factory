import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EliteVFX2D = ({ themeColor }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const cinematicFluidShader = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;

    mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
    
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.777; // 16:9 ratio
      
      vec2 p = uv;
      for(float i = 1.0; i < 6.0; i++) {
        uv.xy += vec2(cos(time*0.1 + uv.y*i), sin(time*0.1 + uv.x*i)) * 0.5;
        uv *= rot(time * 0.05);
      }
      
      float fluid = sin(uv.x) * cos(uv.y);
      vec3 col = colorTheme * (abs(fluid) + 0.1);
      
      // ACES Film Tonemapping
      col = clamp((col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14), 0.0, 1.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try { if (typeof themeColor === 'string' && themeColor.startsWith('#')) safeColor = new THREE.Color(themeColor); } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.3;
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={cinematicFluidShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
