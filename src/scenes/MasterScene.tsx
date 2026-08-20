import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ----------------------------------------------------
// Error Boundary to Prevent WebGL Blackouts
// ----------------------------------------------------
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("⚠️ WebGL Error Boundary caught a render failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ----------------------------------------------------
// Safe Fallback Procedural Particle Nebula
// ----------------------------------------------------
const FallbackScene: React.FC<{ colors: string[] }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#ff007f";
  const c3 = colors[2] || "#7000ff";

  const count = 1200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  return (
    <group rotation={[frame * 0.003, frame * 0.005, 0]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} color={c1} intensity={2.0} />
      <pointLight position={[-10, -10, -10]} color={c2} intensity={2.0} />

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color={c3} transparent opacity={0.8} />
      </points>
    </group>
  );
};

// ----------------------------------------------------
// Dynamic Procedural Particle & Geometry Engine
// ----------------------------------------------------
interface ProceduralEngineProps {
  particleShape: string;
  movementStyle: string;
  colors: string[];
  cameraSpeed: number;
  particleCount: number;
  complexity: number;
  frame: number;
}

const ProceduralEngine: React.FC<ProceduralEngineProps> = ({
  particleShape,
  movementStyle,
  colors,
  cameraSpeed,
  particleCount,
  complexity,
  frame,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#ff007f";
  const c3 = colors[2] || "#7000ff";

  const numParticles = Math.min(Math.max(particleCount || 2500, 1000), 5000);

  // Generate initial particle coordinates and colors
  const { positions, colorBuffer, initialOffsets } = useMemo(() => {
    const pos = new Float32Array(numParticles * 3);
    const cols = new Float32Array(numParticles * 3);
    const offsets = new Float32Array(numParticles * 3);

    const threeCol1 = new THREE.Color(c1);
    const threeCol2 = new THREE.Color(c2);
    const threeCol3 = new THREE.Color(c3);

    for (let i = 0; i < numParticles; i++) {
      const idx = i * 3;
      const t = i / numParticles;

      if (particleShape === "helix") {
        const radius = 3.5 + Math.sin(i * 0.1) * 0.8;
        const angle = i * 0.25;
        pos[idx] = Math.cos(angle) * radius;
        pos[idx + 1] = (t - 0.5) * 22;
        pos[idx + 2] = Math.sin(angle) * radius;
      } else if (particleShape === "spheres") {
        const radius = 2.0 + Math.random() * 10.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        pos[idx] = radius * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
        pos[idx + 2] = radius * Math.cos(phi);
      } else if (particleShape === "lines") {
        pos[idx] = (t - 0.5) * 30;
        pos[idx + 1] = Math.sin(t * Math.PI * 8) * 4;
        pos[idx + 2] = Math.cos(t * Math.PI * 8) * 4;
      } else if (particleShape === "grid") {
        const side = Math.floor(Math.cbrt(numParticles));
        const x = (i % side) - side / 2;
        const y = (Math.floor(i / side) % side) - side / 2;
        const z = Math.floor(i / (side * side)) - side / 2;
        pos[idx] = x * 1.2;
        pos[idx + 1] = y * 1.2;
        pos[idx + 2] = z * 1.2;
      } else {
        // Default "nebula" fractal cloud
        const radius = 1.5 + Math.pow(Math.random(), 0.5) * 14.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        pos[idx] = radius * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
        pos[idx + 2] = radius * Math.cos(phi);
      }

      offsets[idx] = Math.random() * Math.PI * 2;
      offsets[idx + 1] = Math.random() * Math.PI * 2;
      offsets[idx + 2] = Math.random() * Math.PI * 2;

      // Color interpolation
      let mixedColor = threeCol1.clone();
      if (i % 3 === 1) mixedColor.lerp(threeCol2, 0.7);
      else if (i % 3 === 2) mixedColor.lerp(threeCol3, 0.7);

      cols[idx] = mixedColor.r;
      cols[idx + 1] = mixedColor.g;
      cols[idx + 2] = mixedColor.b;
    }

    return { positions: pos, colorBuffer: cols, initialOffsets: offsets };
  }, [numParticles, particleShape, c1, c2, c3]);

  // Setup instanced mesh positions if shape is "spheres"
  const instancedCount = 180;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const time = frame * 0.02 * cameraSpeed * complexity;

    if (groupRef.current) {
      if (movementStyle === "vortex") {
        groupRef.current.rotation.y = time * 0.8;
        groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
      } else if (movementStyle === "orbital") {
        groupRef.current.rotation.y = time * 0.5;
        groupRef.current.rotation.z = time * 0.3;
      } else if (movementStyle === "expansion") {
        const scale = 1.0 + Math.sin(time * 0.8) * 0.25;
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.rotation.y = time * 0.4;
      } else if (movementStyle === "wave") {
        groupRef.current.rotation.y = time * 0.3;
        groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.3;
      } else {
        // quantum_flow
        groupRef.current.rotation.y = time * 0.4;
        groupRef.current.rotation.x = Math.cos(time * 0.3) * 0.25;
        groupRef.current.rotation.z = Math.sin(time * 0.2) * 0.2;
      }
    }

    // Animate Instanced Mesh if active
    if (particleShape === "spheres" && instancedMeshRef.current) {
      for (let i = 0; i < instancedCount; i++) {
        const angle = i * 0.15 + time * 0.6;
        const radius = 4.0 + Math.sin(i * 0.3 + time) * 3.0;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(i * 0.2 + time * 0.8) * 4.0;
        const z = Math.sin(angle) * radius;

        dummy.position.set(x, y, z);
        const s = 0.3 + Math.sin(time + i) * 0.15;
        dummy.scale.set(s, s, s);
        dummy.rotation.set(time + i, time * 0.5, 0);
        dummy.updateMatrix();

        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorBuffer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={particleShape === "lines" ? 0.35 : 0.25}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Instanced Glowing Spheres for Spheres Shape */}
      {particleShape === "spheres" && (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, instancedCount]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={c1}
            emissive={c2}
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={0.9}
          />
        </instancedMesh>
      )}

      {/* Background Energy Rays for Lines or Grid Shapes */}
      {(particleShape === "lines" || particleShape === "grid") && (
        <gridHelper args={[40, 40, c1, c2]} position={[0, -6, 0]} />
      )}
    </group>
  );
};

// ----------------------------------------------------
// Master Scene Router & Postprocessing Pipeline
// ----------------------------------------------------
interface MasterSceneProps {
  data: {
    sceneType?: string;
    particleShape?: string;
    movementStyle?: string;
    colors?: string[];
    cameraSpeed?: number;
    bloomIntensity?: number;
    particleCount?: number;
    complexity?: number;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const particleShape = data?.particleShape || data?.sceneType || 'nebula';
  const movementStyle = data?.movementStyle || 'quantum_flow';
  const colors = Array.isArray(data?.colors) && data.colors.length >= 2
    ? data.colors
    : ['#00f0ff', '#ff007f', '#7000ff'];

  const cameraSpeed = typeof data?.cameraSpeed === 'number' ? data.cameraSpeed : 1.5;
  const bloomIntensity = typeof data?.bloomIntensity === 'number' ? data.bloomIntensity : 2.5;
  const particleCount = typeof data?.particleCount === 'number' ? data.particleCount : 3000;
  const complexity = typeof data?.complexity === 'number' ? data.complexity : 1.0;

  return (
    <ThreeErrorBoundary fallback={<FallbackScene colors={colors} />}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color={colors[0]} />
      <pointLight position={[-12, -12, -12]} intensity={1.8} color={colors[1]} />
      <pointLight position={[12, 12, 12]} intensity={1.8} color={colors[2] || colors[0]} />
      <Environment preset="city" />

      <ProceduralEngine
        particleShape={particleShape}
        movementStyle={movementStyle}
        colors={colors}
        cameraSpeed={cameraSpeed}
        particleCount={particleCount}
        complexity={complexity}
        frame={frame}
      />

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          intensity={bloomIntensity}
        />
      </EffectComposer>
    </ThreeErrorBoundary>
  );
};
