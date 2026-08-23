import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { generateProceduralGLSL } from '../engine/shaders/defaultShaders';

// ----------------------------------------------------
// Error Boundary for GLSL Shader Failures
// ----------------------------------------------------
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ShaderErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("⚠️ GLSL Shader Error Boundary caught compile error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// ------------------------------------------------------------------
// FULLSCREEN GLSL SHADER PLANE (Pure Organic GPU Mathematics)
// ------------------------------------------------------------------
const GLSLFullscreenQuad: React.FC<{
  fragmentShaderCode: string;
  colorPrimary: string;
  colorSecondary: string;
  speed: number;
  seed: number;
}> = ({ fragmentShaderCode, colorPrimary, colorSecondary, speed, seed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frame = useCurrentFrame();

  const safeFrame = typeof frame === 'number' && !isNaN(frame) ? frame : 0;

  const c1 = useMemo(() => new THREE.Color(colorPrimary || '#ff3300'), [colorPrimary]);
  const c2 = useMemo(() => new THREE.Color(colorSecondary || '#00ccff'), [colorSecondary]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(3840, 2160) },
      u_colorPrimary: { value: c1 },
      u_colorSecondary: { value: c2 },
      u_speed: { value: typeof speed === 'number' ? speed : 1.4 },
    }),
    []
  );

  useFrame(() => {
    if (materialRef.current && materialRef.current.uniforms) {
      // Add the seed to the math so the starting position and movement flow is always unique
      materialRef.current.uniforms.u_time.value = (safeFrame / 30.0) + (seed * 0.005);
      materialRef.current.uniforms.u_colorPrimary.value = c1;
      materialRef.current.uniforms.u_colorSecondary.value = c2;
      materialRef.current.uniforms.u_speed.value = typeof speed === 'number' ? speed : 1.4;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin((safeFrame * 0.01) + seed) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragmentShaderCode}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

// ------------------------------------------------------------------
// MASTER SCENE: PURE INFINITE GLSL SHADER ARCHITECTURE
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: {
    commercialConcept?: string;
    glslFragmentShader?: string;
    seed?: number;
    uniforms?: {
      u_colorPrimary?: string;
      u_colorSecondary?: string;
      u_speed?: number;
    };
    colors?: string[];
    [key: string]: any;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const u = data?.uniforms || {};
  const colorPrimary = u.u_colorPrimary || data?.colors?.[0] || '#ff4500';
  const colorSecondary = u.u_colorSecondary || data?.colors?.[1] || '#00d4ff';
  const speed = typeof u.u_speed === 'number' ? u.u_speed : 1.4;
  const seed = typeof data?.seed === 'number' ? data.seed : Math.random() * 1000;

  const fallbackShader = useMemo(() => generateProceduralGLSL('Default Quantum Field', `${seed}`), [seed]);
  const fragShader = data?.glslFragmentShader || fallbackShader;

  return (
    <ShaderErrorBoundary
      fallback={
        <GLSLFullscreenQuad
          fragmentShaderCode={fallbackShader}
          colorPrimary="#ff3300"
          colorSecondary="#00ffff"
          speed={1.2}
          seed={seed}
        />
      }
    >
      <GLSLFullscreenQuad
        fragmentShaderCode={fragShader}
        colorPrimary={colorPrimary}
        colorSecondary={colorSecondary}
        speed={speed}
        seed={seed}
      />
    </ShaderErrorBoundary>
  );
};

export default MasterScene;
