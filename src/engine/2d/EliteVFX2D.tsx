import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EliteVFX2D = ({ themeColor = "#00ffcc" }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Sharp, High-End Cyberpunk Grid & Wave HUD (Goodbye Blurry Pink)
  const sharpTechShader = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.777; // 16:9 widescreen fix

      // Ultra-Sharp Neon Grid
      vec2 gridUv = fract(uv * 12.0 + time * 0.5);
      float grid = step(0.95, gridUv.x) + step(0.95, gridUv.y);
      grid = clamp(grid, 0.0, 1.0);

      // Digital Pulse Waves
      float wave = sin(uv.x * 6.0 + time * 2.0) * cos(uv.y * 6.0 - time);
      float glowLine = 0.03 / (abs(wave) + 0.01);

      // Radar / HUD Rings
      float d = length(uv);
      float rings = sin(d * 25.0 - time * 4.0);
      float ringGlow = 0.04 / (abs(rings) + 0.02);

      vec3 col = colorTheme * (grid * 0.25 + glowLine * 0.9 + ringGlow * 0.6);
      
      // Cinematic Vignette
      col *= 1.0 - smoothstep(0.7, 1.8, d);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try { safeColor = new THREE.Color(themeColor); } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh scale={[40, 25, 1]} position={[0, 0, -5]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={sharpTechShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};
