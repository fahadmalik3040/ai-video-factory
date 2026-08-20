import React, { useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEFAULT_FRAGMENT_SHADER = `
uniform float u_time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float t = u_time * 0.8;
  float d = length(uv);
  vec3 col = vec3(0.0);
  
  for (float i = 1.0; i < 4.0; i++) {
    uv = fract(uv * 1.5) - 0.5;
    float d2 = length(uv) * exp(-d);
    vec3 c = vec3(0.5 + 0.5 * cos(t + i + vec3(0.0, 2.0, 4.0)));
    d2 = sin(d2 * 8.0 + t) / 8.0;
    d2 = abs(d2);
    d2 = pow(0.01 / d2, 1.2);
    col += c * d2;
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`;

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const rawShaderCode = data?.shaderCode && typeof data.shaderCode === 'string' && data.shaderCode.trim().length > 0
    ? data.shaderCode
    : DEFAULT_FRAGMENT_SHADER;

  const uniforms = useMemo(() => {
    return {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(3840, 2160) },
    };
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = frame / 30;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={rawShaderCode}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};
