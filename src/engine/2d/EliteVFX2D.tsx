import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const DEFAULT_FRAGMENT_SHADER = `
  uniform float time;
  uniform vec3 colorTheme;
  uniform vec2 resolution;
  varying vec2 vUv;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float d = length(p);
    float c = sin(d * 12.0 - time * 3.0);
    vec3 col = colorTheme * (0.5 + 0.5 * c) / (d + 0.15);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface EliteVFX2DProps {
  customShader?: string;
  themeColor?: string;
}

export const EliteVFX2D: React.FC<EliteVFX2DProps> = ({ customShader, themeColor = "#00f0ff" }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frame = useCurrentFrame();

  const color = useMemo(() => {
    try {
      return new THREE.Color(themeColor || "#00f0ff");
    } catch {
      return new THREE.Color("#00f0ff");
    }
  }, [themeColor]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorTheme: { value: color },
      resolution: { value: new THREE.Vector2(3840, 2160) },
    }),
    [color]
  );

  useFrame(() => {
    if (materialRef.current && materialRef.current.uniforms) {
      const safeFrame = typeof frame === 'number' && !isNaN(frame) ? frame : 0;
      materialRef.current.uniforms.time.value = safeFrame / 30.0;
      materialRef.current.uniforms.colorTheme.value = color;
      materialRef.current.uniforms.resolution.value.set(3840, 2160);
    }
  });

  const fragShader = useMemo(() => {
    if (!customShader || customShader.trim().length === 0) {
      return DEFAULT_FRAGMENT_SHADER;
    }
    return customShader;
  }, [customShader]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
