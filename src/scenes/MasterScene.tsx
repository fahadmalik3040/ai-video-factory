import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { DEFAULT_GLSL_SHADERS, GLSLVfxCategory } from '../scripts/generate_3d_swarm';

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
// FULLSCREEN GLSL SHADER PLANE (Pure Organic Mathematics)
// ------------------------------------------------------------------
const GLSLFullscreenQuad: React.FC<{
  fragmentShaderCode: string;
  color1: string;
  color2: string;
  speed: number;
  density: number;
}> = ({ fragmentShaderCode, color1, color2, speed, density }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frame = useCurrentFrame();

  const c1 = useMemo(() => new THREE.Color(color1 || '#ff3300'), [color1]);
  const c2 = useMemo(() => new THREE.Color(color2 || '#00ccff'), [color2]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(3840, 2160) },
      u_color1: { value: c1 },
      u_color2: { value: c2 },
      u_speed: { value: speed },
      u_density: { value: density },
    }),
    []
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = frame / 30.0;
      materialRef.current.uniforms.u_color1.value = c1;
      materialRef.current.uniforms.u_color2.value = c2;
      materialRef.current.uniforms.u_speed.value = speed;
      materialRef.current.uniforms.u_density.value = density;
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
// MASTER SCENE: PURE GLSL SHADER ARCHITECTURE
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: {
    vfxCategory?: GLSLVfxCategory;
    glslFragmentShader?: string;
    uniforms?: {
      color1?: string;
      color2?: string;
      speed?: number;
      density?: number;
    };
    colors?: string[];
    [key: string]: any;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const category = (data?.vfxCategory as GLSLVfxCategory) || 'liquid_fire';

  const fragShader =
    data?.glslFragmentShader ||
    DEFAULT_GLSL_SHADERS[category] ||
    DEFAULT_GLSL_SHADERS.liquid_fire;

  const u = data?.uniforms || {};
  const color1 = u.color1 || data?.colors?.[0] || '#ff4500';
  const color2 = u.color2 || data?.colors?.[1] || '#00d4ff';
  const speed = typeof u.speed === 'number' ? u.speed : 1.4;
  const density = typeof u.density === 'number' ? u.density : 3.2;

  const fallbackShader = DEFAULT_GLSL_SHADERS.liquid_fire;

  return (
    <ShaderErrorBoundary
      fallback={
        <GLSLFullscreenQuad
          fragmentShaderCode={fallbackShader}
          color1="#ff3300"
          color2="#00ffff"
          speed={1.2}
          density={3.0}
        />
      }
    >
      <GLSLFullscreenQuad
        fragmentShaderCode={fragShader}
        color1={color1}
        color2={color2}
        speed={speed}
        density={density}
      />
    </ShaderErrorBoundary>
  );
};

export default MasterScene;
