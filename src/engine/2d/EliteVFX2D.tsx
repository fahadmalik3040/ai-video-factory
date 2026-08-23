import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SHADER_LIBRARY: Record<string, string> = {
  fluid_caustics: `
    uniform float time; uniform vec3 colorTheme; varying vec2 vUv;
    void main() {
      vec2 p = vUv * 3.0 - 1.5;
      for(int i=1; i<5; i++) {
        vec2 newp = p;
        newp.x += 0.6/float(i)*sin(float(i)*p.y+time/2.0+0.3);
        newp.y += 0.6/float(i)*cos(float(i)*p.x+time/2.0+0.3);
        p = newp;
      }
      float f = 0.5 / length(sin(p));
      gl_FragColor = vec4(colorTheme * f, 1.0);
    }
  `,
  cosmic_energy: `
    uniform float time; uniform vec3 colorTheme; varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float t = time * 0.5;
      float d = length(p);
      float angle = atan(p.y, p.x) + t;
      float radius = length(p);
      float wave = sin(10.0 * radius - 4.0 * t + 5.0 * angle);
      float glow = 0.05 / (abs(wave) + 0.01) * exp(-2.0 * radius);
      gl_FragColor = vec4(colorTheme * glow * 2.0, 1.0);
    }
  `,
  neon_lightning: `
    uniform float time; uniform vec3 colorTheme; varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float wave = p.y + sin(p.x * 5.0 + time * 3.0) * 0.2 + cos(p.x * 10.0 + time * 5.0) * 0.1;
      float glow = 0.01 / abs(wave);
      gl_FragColor = vec4(colorTheme * glow * 1.5, 1.0);
    }
  `,
  raymarched_core: `
    uniform float time; uniform vec3 colorTheme; varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float len = length(p);
      float ring = abs(len - 0.5) - 0.02;
      float core = 0.02 / (length(p) + 0.01);
      float ringGlow = 0.01 / (abs(ring) + 0.005);
      vec3 finalColor = colorTheme * (core + ringGlow + sin(time)*0.1);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const EliteVFX2D = ({ themeColor, shaderType = "cosmic_energy", bloomIntensity, speed = 1.0 }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  
  const selectedShader = SHADER_LIBRARY[shaderType] || SHADER_LIBRARY["cosmic_energy"];

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try { if (typeof themeColor === 'string' && themeColor.startsWith('#')) safeColor = new THREE.Color(themeColor); } catch (e) {}
    return {
      time: { value: 0 },
      colorTheme: { value: safeColor },
      speed: { value: typeof speed === 'number' ? speed : 1.0 }
    };
  }, [themeColor, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      const spd = typeof speed === 'number' ? speed : 1.0;
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * spd;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={selectedShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
