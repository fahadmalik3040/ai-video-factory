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

// PURE RAYMARCHING VOLUMETRIC SHADER (ZERO PARTICLES/TEMPLATES)
const fragmentShader = `
  uniform float time;
  uniform vec3 colorTheme;
  varying vec2 vUv;

  mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
  }

  void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.777; // 4K 16:9 aspect ratio

      // Cinematic Camera Setup
      vec3 ro = vec3(0.0, 0.0, -3.0);
      vec3 rd = normalize(vec3(uv, 1.0));

      float d = 0.0;
      float t = time * 0.25;
      vec3 p;
      
      // Volumetric light computation
      float glow = 0.0;
      for(int i = 0; i < 70; i++) {
          p = ro + rd * d;
          
          // Organic fluid space distortion
          p.xz *= rot(t);
          p.xy *= rot(t * 0.6);
          
          // Quantum wave structure
          float q = length(p) - 1.2;
          q += sin(p.x * 3.0 + t * 2.0) * 0.15;
          q += cos(p.y * 4.0 - t) * 0.2;
          q += sin(p.z * 5.0 + t * 1.5) * 0.1;
          
          glow += 0.008 / (0.01 + abs(q));
          d += 0.04;
      }

      // Premium Color Mapping & Density
      vec3 col = colorTheme * glow * 0.25;
      col = mix(col, vec3(1.0), glow * 0.03); // Hot core highlights
      
      // High-End Hollywood Vignette
      col *= 1.0 - smoothstep(0.4, 2.5, length(uv));

      gl_FragColor = vec4(col, 1.0);
  }
`;

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const hexColor = data?.lighting?.colorTheme || data?.environment?.primaryColor || "#00ffcc";
  const threeColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: threeColor }
  }), [threeColor]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) materialRef.current.uniforms.time.value = frame * 0.04;
  });

  return (
    <group>
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
