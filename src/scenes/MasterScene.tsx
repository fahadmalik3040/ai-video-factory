import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ----------------------------------------------------
// Error Boundary to prevent WebGL Blackouts
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
// Fallback Scene: Safe Glowing Particle / Torus System
// ----------------------------------------------------
const FallbackScene: React.FC<{ colors: string[] }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#ff007f";

  const particleCount = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [particleCount]);

  return (
    <group rotation={[frame * 0.005, frame * 0.008, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color={c1} />
      <mesh>
        <torusKnotGeometry args={[3, 0.8, 128, 32]} />
        <meshStandardMaterial
          color={c1}
          emissive={c2}
          emissiveIntensity={1.2}
          wireframe
          roughness={0.2}
        />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color={c1} transparent opacity={0.8} />
      </points>
    </group>
  );
};

// ----------------------------------------------------
// Finance Module: 3D Glowing Candlesticks & Charts
// ----------------------------------------------------
const FinanceScene: React.FC<{ colors: string[]; cameraSpeed: number; frame: number }> = ({ colors, cameraSpeed, frame }) => {
  const primaryColor = colors[0] || "#00ffcc";
  const secondaryColor = colors[1] || "#ff007f";

  const groupRef = useRef<THREE.Group>(null);

  const bars = useMemo(() => {
    const list = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const x = (i - count / 2) * 1.3;
      const baseHeight = 1.8 + Math.sin(i * 0.4) * 1.5 + Math.cos(i * 0.7) * 1.0;
      list.push({ x, baseHeight, phase: i * 0.35, isGreen: i % 2 === 0 });
    }
    return list;
  }, []);

  const particleCount = 200;
  const particles = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [particleCount]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = frame * 0.003 * cameraSpeed;
      groupRef.current.rotation.x = Math.sin(frame * 0.002) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Grid Floor */}
      <gridHelper args={[50, 50, primaryColor, "#111827"]} position={[0, -5, 0]} />

      {/* Candlestick Bars & Wicks */}
      {bars.map((bar, idx) => {
        const height = Math.max(0.6, bar.baseHeight + Math.sin(frame * 0.04 * cameraSpeed + bar.phase) * 1.1);
        const col = bar.isGreen ? primaryColor : secondaryColor;

        return (
          <group key={idx} position={[bar.x, height / 2 - 2, 0]}>
            {/* Box Body */}
            <mesh>
              <boxGeometry args={[0.7, height, 0.7]} />
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={1.4}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Wick */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, height + 1.6, 0.1]} />
              <meshBasicMaterial color={col} />
            </mesh>
          </group>
        );
      })}

      {/* Floating Market Data Particles */}
      <points position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.25} color={primaryColor} transparent opacity={0.85} />
      </points>
    </group>
  );
};

// ----------------------------------------------------
// Science Module: Rotating DNA Double Helix
// ----------------------------------------------------
const ScienceScene: React.FC<{ colors: string[]; cameraSpeed: number; frame: number }> = ({ colors, cameraSpeed, frame }) => {
  const color1 = colors[0] || "#00f0ff";
  const color2 = colors[1] || "#a855f7";

  const groupRef = useRef<THREE.Group>(null);
  const numNodes = 44;
  const radius = 4.0;
  const heightStep = 0.35;

  const helixNodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < numNodes; i++) {
      const y = (i - numNodes / 2) * heightStep;
      const angle = i * 0.32;
      list.push({ id: i, y, angle });
    }
    return list;
  }, []);

  const particleCount = 250;
  const bgParticles = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [particleCount]);

  const rotationAngle = frame * 0.02 * cameraSpeed;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationAngle;
      groupRef.current.rotation.z = Math.sin(frame * 0.003) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {helixNodes.map((node) => {
        const a = node.angle;
        const x1 = Math.cos(a) * radius;
        const z1 = Math.sin(a) * radius;
        const x2 = Math.cos(a + Math.PI) * radius;
        const z2 = Math.sin(a + Math.PI) * radius;

        return (
          <group key={node.id} position={[0, node.y, 0]}>
            {/* Strand 1 Node */}
            <mesh position={[x1, 0, z1]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={1.8} />
            </mesh>

            {/* Strand 2 Node */}
            <mesh position={[x2, 0, z2]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={1.8} />
            </mesh>

            {/* Connecting Horizontal Rung */}
            <mesh position={[0, 0, 0]} rotation={[0, -a, 0]}>
              <boxGeometry args={[radius * 2, 0.09, 0.09]} />
              <meshStandardMaterial color="#ffffff" emissive="#3b82f6" emissiveIntensity={1.0} />
            </mesh>
          </group>
        );
      })}

      {/* Ambient Biotech Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[bgParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color={color1} transparent opacity={0.7} />
      </points>
    </group>
  );
};

// ----------------------------------------------------
// Cyber Module: 3D Grid & Floating Polyhedron Nodes
// ----------------------------------------------------
const CyberScene: React.FC<{ colors: string[]; cameraSpeed: number; frame: number }> = ({ colors, cameraSpeed, frame }) => {
  const primaryColor = colors[0] || "#ff007f";
  const secondaryColor = colors[1] || "#00f0ff";

  const groupRef = useRef<THREE.Group>(null);

  const polyhedrons = useMemo(() => {
    const list = [];
    for (let i = 0; i < 32; i++) {
      list.push({
        id: i,
        pos: [
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 18,
        ] as [number, number, number],
        scale: 0.5 + Math.random() * 0.8,
        speed: 0.5 + Math.random() * 0.8,
        wireframe: i % 3 === 0,
        shapeType: i % 3,
      });
    }
    return list;
  }, []);

  const particleCount = 300;
  const cyberMatrix = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [particleCount]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = frame * 0.004 * cameraSpeed;
      groupRef.current.rotation.x = 0.2 + Math.sin(frame * 0.002) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dual Cyber Grids */}
      <gridHelper args={[60, 60, primaryColor, secondaryColor]} position={[0, -7, 0]} />
      <gridHelper args={[60, 60, secondaryColor, primaryColor]} position={[0, 7, 0]} />

      {/* Floating Geometric Nodes */}
      {polyhedrons.map((item) => {
        const rot = frame * 0.015 * item.speed * cameraSpeed + item.id;
        const yPos = item.pos[1] + Math.sin(frame * 0.03 + item.id) * 0.6;
        const col = item.id % 2 === 0 ? primaryColor : secondaryColor;

        return (
          <mesh
            key={item.id}
            position={[item.pos[0], yPos, item.pos[2]]}
            rotation={[rot, rot * 0.8, 0]}
            scale={item.scale}
          >
            {item.shapeType === 0 ? (
              <icosahedronGeometry args={[1, 0]} />
            ) : item.shapeType === 1 ? (
              <octahedronGeometry args={[1, 0]} />
            ) : (
              <boxGeometry args={[1.2, 1.2, 1.2]} />
            )}
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={1.5}
              wireframe={item.wireframe}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* Cyber Particle Matrix */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[cyberMatrix, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color={secondaryColor} transparent opacity={0.8} />
      </points>
    </group>
  );
};

// ----------------------------------------------------
// Master Scene Router with Postprocessing Bloom
// ----------------------------------------------------
interface MasterSceneProps {
  data: {
    sceneType?: 'finance' | 'science' | 'cyber';
    colors?: string[];
    cameraSpeed?: number;
    bloomIntensity?: number;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const sceneType = data?.sceneType || 'cyber';
  const colors = Array.isArray(data?.colors) && data.colors.length >= 2
    ? data.colors
    : ['#00f0ff', '#ff007f'];
  const cameraSpeed = typeof data?.cameraSpeed === 'number' ? data.cameraSpeed : 1.5;
  const bloomIntensity = typeof data?.bloomIntensity === 'number' ? data.bloomIntensity : 2.0;

  const renderModule = () => {
    switch (sceneType) {
      case 'finance':
        return <FinanceScene colors={colors} cameraSpeed={cameraSpeed} frame={frame} />;
      case 'science':
        return <ScienceScene colors={colors} cameraSpeed={cameraSpeed} frame={frame} />;
      case 'cyber':
      default:
        return <CyberScene colors={colors} cameraSpeed={cameraSpeed} frame={frame} />;
    }
  };

  return (
    <ThreeErrorBoundary fallback={<FallbackScene colors={colors} />}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[12, 20, 15]} intensity={1.8} />
      <pointLight position={[-10, -10, -10]} intensity={1.2} color={colors[0]} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color={colors[1]} />

      {renderModule()}

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          intensity={bloomIntensity}
        />
      </EffectComposer>
    </ThreeErrorBoundary>
  );
};
