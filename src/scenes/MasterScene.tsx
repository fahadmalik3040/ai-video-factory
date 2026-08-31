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
  uniform float seedMultiplier;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= 1.777;

    float t = time * 0.3;
    vec2 p = uv;
    
    // Dynamic math distortion based on live research trend seed
    for(float i = 1.0; i < 5.0; i++) {
      p.xy += vec2(cos(t * seedMultiplier + p.y * i), sin(t * seedMultiplier - p.x * i)) * 0.5;
    }
    
    float fluid = sin(p.x * seedMultiplier) * cos(p.y * seedMultiplier);
    float glow = 0.04 / (abs(fluid) + 0.015);

    vec3 baseColor = colorTheme * glow * 0.8;
    baseColor *= 1.0 - smoothstep(0.5, 2.2, length(uv));

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const hexColor = data?.lighting?.colorTheme || data?.environment?.primaryColor || "#00ffcc";
  const threeColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);
  
  // Generate a unique mathematical seed from the research title/prompt length so visuals change entirely per trend
  const trendText = data?.title || data?.prompt || "dynamic stock flow";
  const seedMultiplier = useMemo(() => {
    let hash = 1;
    for (let i = 0; i < trendText.length; i++) {
      hash = (hash * trendText.charCodeAt(i)) % 7 + 2; // Unique multiplier between 2 and 9
    }
    return Math.max(2.5, hash);
  }, [trendText]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: threeColor },
    seedMultiplier: { value: seedMultiplier }
  }), [threeColor, seedMultiplier]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) materialRef.current.uniforms.time.value = frame * 0.03;
  });

  return (
    <group>
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[100, 60]} />
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
