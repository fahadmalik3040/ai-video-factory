import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';

const fallbackShader = `
  uniform float time;
  uniform vec3 colorTheme;
  uniform vec2 resolution;
  uniform float bloomIntensity;
  uniform float aberration;
  varying vec2 vUv;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float d = length(p);
    float glow = (0.3 * bloomIntensity) / (d + 0.1);
    vec3 col = colorTheme * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface EliteVFX2DProps {
  themeColor?: string;
  customShader?: string;
  bloomIntensity?: number;
  aberration?: number;
}

export const EliteVFX2D: React.FC<EliteVFX2DProps> = ({
  themeColor = "#ff0055",
  customShader = fallbackShader,
  bloomIntensity = 1.5,
  aberration = 0.005
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frame = useCurrentFrame();

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const finalFragmentShader = (customShader && customShader.includes('void main')) 
    ? customShader 
    : fallbackShader;

  const color = useMemo(() => {
    try {
      return new THREE.Color(themeColor || "#ff0055");
    } catch {
      return new THREE.Color("#ff0055");
    }
  }, [themeColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: color },
    resolution: { value: new THREE.Vector2(3840, 2160) },
    bloomIntensity: { value: bloomIntensity },
    aberration: { value: aberration }
  }), [color, bloomIntensity, aberration]);

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      const safeTime = typeof frame === 'number' && !isNaN(frame)
        ? frame / 30.0
        : state.clock.elapsedTime;
      materialRef.current.uniforms.time.value = safeTime;
      materialRef.current.uniforms.colorTheme.value = color;
      materialRef.current.uniforms.resolution.value.set(3840, 2160);
      materialRef.current.uniforms.bloomIntensity.value = bloomIntensity;
      materialRef.current.uniforms.aberration.value = aberration;
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
