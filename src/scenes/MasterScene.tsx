import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { useCurrentFrame, useVideoConfig } from 'remotion';
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
// VIRTUAL DP CAMERA RIG (Safe Cinematic Camera Paths)
// ----------------------------------------------------
const VirtualDPCamera: React.FC<{ motionStyle?: string }> = ({ motionStyle = 'slow_macro_dolly' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames = durationInFrames || 450;
  const progress = Math.min(Math.max(frame / totalFrames, 0), 1);

  const orbitCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 4, 32),
        new THREE.Vector3(20, 5, 22),
        new THREE.Vector3(28, 2, 0),
        new THREE.Vector3(20, -3, -22),
        new THREE.Vector3(0, 2, -32),
        new THREE.Vector3(-20, 4, -22),
        new THREE.Vector3(-28, 2, 0),
        new THREE.Vector3(-20, -2, 22),
        new THREE.Vector3(0, 4, 32),
      ],
      true
    );
  }, []);

  const dollyCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 6, 38),
      new THREE.Vector3(2.0, 4.0, 28),
      new THREE.Vector3(-1.5, 2.5, 20),
      new THREE.Vector3(0.5, 1.0, 15),
      new THREE.Vector3(0, 0.5, 12),
    ]);
  }, []);

  useFrame(({ camera }) => {
    let targetPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(0, 0, 0);

    if (motionStyle === 'slow_macro_dolly' || motionStyle === 'smooth_dolly_in') {
      const easedT = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      targetPos = dollyCurve.getPointAt(easedT);
      lookTarget.set(0, Math.sin(progress * Math.PI) * 0.3, 0);
    } else {
      const orbitT = (progress * 0.75) % 1;
      targetPos = orbitCurve.getPointAt(orbitT);
      lookTarget.set(0, Math.sin(progress * Math.PI * 2) * 0.4, 0);
    }

    camera.position.copy(targetPos);
    camera.lookAt(lookTarget);
  });

  return null;
};

// ------------------------------------------------------------------
// LAYER 1: BACKGROUND ENVIRONMENT (InfiniteGrid | DataWaves | BinaryTunnel)
// ------------------------------------------------------------------
const BackgroundEnvironment: React.FC<{ geometry?: string; materialStyle?: string; color: string; frame: number }> = ({
  geometry = 'InfiniteGrid',
  materialStyle = 'neon_wireframe',
  color,
  frame,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.1;

  if (geometry === 'BinaryTunnel') {
    return (
      <group ref={groupRef} rotation={[0, 0, t * 0.2]}>
        {Array.from({ length: 18 }).map((_, i) => {
          const z = (i - 9) * 4;
          return (
            <mesh key={i} position={[0, 0, z]}>
              <torusGeometry args={[14, 0.08, 16, 48]} />
              <meshBasicMaterial color={color} opacity={0.35} transparent />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (geometry === 'DataWaves') {
    return (
      <group position={[0, -5, 0]} rotation={[-Math.PI / 3, 0, t * 0.05]}>
        <mesh>
          <planeGeometry args={[40, 40, 40, 40]} />
          <meshBasicMaterial color={color} wireframe opacity={0.25} transparent />
        </mesh>
      </group>
    );
  }

  // Default: InfiniteGrid
  return (
    <group position={[0, -6, 0]}>
      <gridHelper args={[60, 40, color, color]} position={[0, 0, 0]}>
        <meshBasicMaterial color={color} opacity={0.3} transparent />
      </gridHelper>
    </group>
  );
};

// ------------------------------------------------------------------
// LAYER 2: HERO SUBJECT (TorusKnot | ParametricTubes | FractalIcosahedron)
// ------------------------------------------------------------------
const HeroSubject: React.FC<{
  geometry?: string;
  materialStyle?: string;
  color: string;
  scale?: number;
  frame: number;
}> = ({ geometry = 'TorusKnot', materialStyle = 'liquid_metal', color, scale = 1.6, frame }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const t = (frame / 30) * 0.15;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.6;
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.z = Math.sin(t * 0.4) * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 1.2;
    }
  });

  const materialElement = useMemo(() => {
    if (materialStyle === 'frosted_glass') {
      return (
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.15}
          transmission={0.9}
          ior={1.5}
          thickness={1.2}
          clearcoat={1.0}
        />
      );
    }
    if (materialStyle === 'glowing_plasma') {
      return (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.4}
        />
      );
    }
    // Default: liquid_metal
    return (
      <meshPhysicalMaterial
        color={color}
        metalness={1.0}
        roughness={0.06}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
      />
    );
  }, [materialStyle, color]);

  if (geometry === 'FractalIcosahedron') {
    return (
      <group scale={scale}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2.5, 0]} />
          {materialElement}
        </mesh>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </group>
    );
  }

  if (geometry === 'ParametricTubes') {
    return (
      <group ref={meshRef} scale={scale}>
        <mesh>
          <torusGeometry args={[2.8, 0.45, 24, 64]} />
          {materialElement}
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.0, 0.35, 24, 64]} />
          {materialElement}
        </mesh>
      </group>
    );
  }

  // Default: TorusKnot
  return (
    <mesh ref={meshRef} scale={scale}>
      <torusKnotGeometry args={[2.2, 0.65, 180, 48]} />
      {materialElement}
    </mesh>
  );
};

// ------------------------------------------------------------------
// LAYER 3: FLOATING ACCENTS (DataCubes | TechRings)
// ------------------------------------------------------------------
const FloatingAccents: React.FC<{
  geometry?: string;
  color: string;
  count?: number;
  frame: number;
}> = ({ geometry = 'DataCubes', color, count = 150, frame }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = (frame / 30) * 0.12;

  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const radius = 6 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);
      const scale = 0.15 + Math.random() * 0.35;
      const rotSpeed = 0.5 + Math.random();
      return { x, y, z, scale, rotSpeed, offset: Math.random() * 10 };
    });
  }, [count]);

  useFrame(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const pt = points[i];
        const curY = pt.y + Math.sin(t * pt.rotSpeed + pt.offset) * 0.8;
        dummy.position.set(pt.x, curY, pt.z);
        dummy.scale.set(pt.scale, pt.scale, pt.scale);
        dummy.rotation.set(t * pt.rotSpeed, t * pt.rotSpeed * 0.5, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {geometry === 'TechRings' ? (
        <torusGeometry args={[1, 0.15, 12, 24]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshBasicMaterial color={color} wireframe />
    </instancedMesh>
  );
};

// ------------------------------------------------------------------
// MASTER COMPOSITION ROUTER & POST-PROCESSING PIPELINE
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: {
    seoPackage?: any;
    cinematicVFX?: {
      bloomIntensity?: number;
      chromaticAberrationOffset?: number;
      noiseOpacity?: number;
      vignette?: boolean;
    };
    environment?: {
      bgColor?: string;
      fogColor?: string;
      fogDensity?: number;
    };
    cameraDP?: {
      fov?: number;
      motionStyle?: string;
      motionPath?: string;
    };
    compositionLayers?: Array<{
      role: 'Background_Environment' | 'Hero_Subject' | 'Floating_Accents';
      geometry?: string;
      materialStyle?: string;
      color: string;
      scale?: number;
      instancedCount?: number;
    }>;
    engine3D?: any;
    colors?: string[];
    [key: string]: any;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const vfx = data?.cinematicVFX || {};
  const bloomIntensity = typeof vfx.bloomIntensity === 'number' ? vfx.bloomIntensity : 2.5;
  const caOffset = typeof vfx.chromaticAberrationOffset === 'number' ? vfx.chromaticAberrationOffset : 0.004;
  const noiseOpacity = typeof vfx.noiseOpacity === 'number' ? vfx.noiseOpacity : 0.035;

  const env = data?.environment || {};
  const fogColor = env.fogColor || '#04050d';
  const fogDensity = typeof env.fogDensity === 'number' ? env.fogDensity : 0.025;

  const camConfig = data?.cameraDP || {};
  const motionStyle = camConfig.motionStyle || camConfig.motionPath || 'slow_macro_dolly';

  const layers = Array.isArray(data?.compositionLayers) && data.compositionLayers.length > 0
    ? data.compositionLayers
    : [
        { role: 'Background_Environment', geometry: 'InfiniteGrid', materialStyle: 'neon_wireframe', color: '#00f0ff' },
        { role: 'Hero_Subject', geometry: 'TorusKnot', materialStyle: 'liquid_metal', color: '#ff007f', scale: 1.6 },
        { role: 'Floating_Accents', geometry: 'DataCubes', materialStyle: 'pure_emission', color: '#7000ff', instancedCount: 150 },
      ];

  const bgLayer = layers.find((l) => l.role === 'Background_Environment') || layers[0];
  const heroLayer = layers.find((l) => l.role === 'Hero_Subject') || layers[1] || layers[0];
  const accentLayer = layers.find((l) => l.role === 'Floating_Accents') || layers[2] || layers[0];

  return (
    <ThreeErrorBoundary fallback={<mesh><boxGeometry /><meshBasicMaterial color="#00f0ff" /></mesh>}>
      {/* Fog & Virtual DP Camera */}
      <fogExp2 attach="fog" color={fogColor} density={fogDensity} />
      <VirtualDPCamera motionStyle={motionStyle} />

      {/* Cinematic Lighting Rig */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 8]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-12, -10, -8]} intensity={4.0} color={heroLayer.color} />
      <pointLight position={[12, 12, 8]} intensity={4.0} color={bgLayer.color} />
      <Environment preset="city" />

      {/* 1. Background Environment Layer */}
      <BackgroundEnvironment
        geometry={bgLayer.geometry}
        materialStyle={bgLayer.materialStyle}
        color={bgLayer.color}
        frame={frame}
      />

      {/* 2. Hero Subject Layer */}
      <HeroSubject
        geometry={heroLayer.geometry}
        materialStyle={heroLayer.materialStyle}
        color={heroLayer.color}
        scale={heroLayer.scale || 1.6}
        frame={frame}
      />

      {/* 3. Floating Accents Layer */}
      <FloatingAccents
        geometry={accentLayer.geometry}
        color={accentLayer.color}
        count={accentLayer.instancedCount || 150}
        frame={frame}
      />

      {/* Heavy Cinematic Post-Processing Pipeline */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
          intensity={bloomIntensity}
        />
        <ChromaticAberration offset={new THREE.Vector2(caOffset, caOffset)} />
        <Noise opacity={noiseOpacity} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </ThreeErrorBoundary>
  );
};

export default MasterScene;
