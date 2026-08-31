import React, { useRef, useMemo, Suspense } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
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
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 1.777; // 16:9 fix
    
    // Hollywood Level Organic Fluid Math
    float t = time * 0.4;
    float fluid = sin(p.x * 8.0 + t) * cos(p.y * 8.0 + t);
    fluid += sin(p.y * 6.0 - t * 1.5) * cos(p.x * 6.0 + t * 1.2);
    
    float glow = 0.08 / (length(p) + 0.1);
    
    vec3 baseColor = colorTheme * (abs(fluid) * 0.5 + 0.3);
    vec3 finalColor = baseColor + glow * colorTheme * 1.5;

    // Smooth edge fade
    float alpha = 1.0 - smoothstep(0.6, 2.0, length(p));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// 1. All 3D and Shader logic inside the Canvas context
export const InnerSceneElements = ({ data }: any) => {
  const frame = useCurrentFrame();
  const hexColor = data?.lighting?.colorTheme || data?.colorTheme || "#00ffcc";
  const threeColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    colorTheme: { value: threeColor }
  }), [threeColor]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Safe Particle Count for Cloud (10,000)
  const [positions] = useMemo(() => {
    const pos = new Float32Array(10000 * 3);
    for (let i = 0; i < 10000 * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 60;
    }
    return [pos];
  }, []);

  // Safe useFrame hook inside R3F Canvas
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = frame * 0.05;
    }
  });

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />

      {/* Background ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={10000} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={hexColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* The Hero Shader Plane */}
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

// 2. MasterScene serves as the standalone Canvas Wrapper
export const MasterScene = ({ data }: any) => {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 3840, height: 2160, backgroundColor: '#020202', overflow: 'hidden' }}>
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
        style={{ width: 3840, height: 2160, display: 'block' }}
      >
        <Suspense fallback={null}>
          <InnerSceneElements data={data} />
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};
