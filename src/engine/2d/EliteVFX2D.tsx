import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SHADER_LIBRARY: Record<string, string> = {
  fluid_caustics: `uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 3.0 - 1.5; for(int i=1; i<5; i++) { vec2 newp = p; newp.x += 0.6/float(i)*sin(float(i)*p.y+time/2.0+0.3); newp.y += 0.6/float(i)*cos(float(i)*p.x+time/2.0+0.3); p = newp; } gl_FragColor = vec4(colorTheme * (0.5 / length(sin(p))), 1.0); }`,
  cosmic_energy: `uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float radius = length(p); float wave = sin(10.0 * radius - 2.0 * time + 5.0 * atan(p.y, p.x)); gl_FragColor = vec4(colorTheme * (0.05 / (abs(wave) + 0.01) * exp(-2.0 * radius)) * 2.0, 1.0); }`,
  neon_lightning: `uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float wave = p.y + sin(p.x * 5.0 + time * 3.0) * 0.2 + cos(p.x * 10.0 + time * 5.0) * 0.1; gl_FragColor = vec4(colorTheme * (0.01 / abs(wave)) * 1.5, 1.0); }`,
  raymarched_core: `uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float ring = abs(length(p) - 0.5) - 0.02; gl_FragColor = vec4(colorTheme * ((0.02 / (length(p) + 0.01)) + (0.01 / (abs(ring) + 0.005))), 1.0); }`
};

export const EliteVFX2D = ({ themeColor, shaderCategory = "cosmic_energy" }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try { if (typeof themeColor === 'string' && themeColor.startsWith('#')) safeColor = new THREE.Color(themeColor); } catch (e) {}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={SHADER_LIBRARY[shaderCategory] || SHADER_LIBRARY["cosmic_energy"]}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
