import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PremiumParticles3D = ({ themeColor = "#ff0055", particleCount = 18000 }: any) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const scl = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const r = 15 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      scl[i] = Math.random();
    }
    return [pos, scl];
  }, [particleCount]);

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#6495ed");
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      if (pointsRef.current.material && (pointsRef.current.material as THREE.ShaderMaterial).uniforms) {
        (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-scale" count={particleCount} array={scales} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial 
        uniforms={uniforms}
        vertexShader="attribute float scale; uniform float time; varying float vAlpha; void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = scale * (300.0 / -mvPosition.z) * (1.0 + sin(time + scale * 10.0)*0.5); vAlpha = scale; gl_Position = projectionMatrix * mvPosition; }"
        fragmentShader="uniform vec3 colorTheme; varying float vAlpha; void main() { float dist = length(gl_PointCoord - vec2(0.5)); if (dist > 0.5) discard; float glow = exp(-dist * 4.0); gl_FragColor = vec4(colorTheme * glow, vAlpha * (1.0 - dist * 2.0)); }"
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default PremiumParticles3D;
