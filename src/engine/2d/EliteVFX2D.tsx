import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';

const DEFAULT_2D_SHADER = `
  uniform float time;
  uniform vec3 colorTheme;
  uniform vec2 resolution;
  uniform float bloomIntensity;
  varying vec2 vUv;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float d = length(p);
    for(int i = 1; i < 5; i++) {
      float fi = float(i);
      p.x += 0.4 / fi * sin(fi * 3.0 * p.y + time * 0.8);
      p.y += 0.4 / fi * cos(fi * 3.0 * p.x + time * 0.8);
    }
    float glow = (0.25 * bloomIntensity) / (length(p) + 0.15);
    vec3 col = colorTheme * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface EliteVFX2DProps {
  customShader?: string;
  themeColor?: string;
  bloomIntensity?: number;
  [key: string]: any;
}

export const EliteVFX2D: React.FC<EliteVFX2DProps> = ({
  customShader,
  themeColor = "#ff0055",
  bloomIntensity = 1.5,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frame = useCurrentFrame();

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const finalFragmentShader = (typeof customShader === 'string' && customShader.includes('void main'))
    ? customShader
    : DEFAULT_2D_SHADER;

  const color = useMemo(() => {
    let safeColor = new THREE.Color("#ff0055");
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch {
      safeColor = new THREE.Color("#ff0055");
    }
    return safeColor;
  }, [themeColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: color },
    resolution: { value: new THREE.Vector2(3840, 2160) },
    bloomIntensity: { value: typeof bloomIntensity === 'number' ? bloomIntensity : 1.5 },
  }), [color, bloomIntensity]);

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      const safeTime = typeof frame === 'number' && !isNaN(frame)
        ? frame / 30.0
        : state.clock.elapsedTime;
      materialRef.current.uniforms.time.value = safeTime;
      materialRef.current.uniforms.colorTheme.value = color;
      materialRef.current.uniforms.resolution.value.set(3840, 2160);
      materialRef.current.uniforms.bloomIntensity.value = typeof bloomIntensity === 'number' ? bloomIntensity : 1.5;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={finalFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
