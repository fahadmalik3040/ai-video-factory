import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Float, Sparkles, Stars, MeshTransmissionMaterial } from '@react-three/drei';
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
// VIRTUAL DP CINEMATIC CAMERA (Slow Motion Paths)
// ----------------------------------------------------
const VirtualDPCamera: React.FC<{ motion?: string; speed?: number }> = ({ motion = 'slow_pan', speed = 1.0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames = durationInFrames || 450;
  const progress = Math.min(Math.max(frame / totalFrames, 0), 1);

  useFrame(({ camera }) => {
    const t = progress * speed;
    if (motion === 'orbit') {
      const angle = t * Math.PI * 1.5;
      camera.position.set(Math.sin(angle) * 26, 4 + Math.sin(t * Math.PI) * 2, Math.cos(angle) * 26);
      camera.lookAt(0, 0, 0);
    } else {
      // Default slow pan / dolly in
      const easedT = 0.5 - 0.5 * Math.cos(t * Math.PI);
      const z = 32 - easedT * 14;
      const x = Math.sin(easedT * Math.PI) * 3;
      const y = 3 + Math.cos(easedT * Math.PI) * 1.5;
      camera.position.set(x, y, z);
      camera.lookAt(0, Math.sin(t * Math.PI) * 0.5, 0);
    }
  });

  return null;
};

// ------------------------------------------------------------------
// PRO-VFX MODULE 1: DATA TUNNEL (Glowing Wireframe Tube + Sparkles)
// ------------------------------------------------------------------
const DataTunnelModule: React.FC<{ colors: string[]; speed: number; frame: number }> = ({ colors, speed, frame }) => {
  const [c1, c2] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * speed;

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(5, 3, -25),
      new THREE.Vector3(-4, -2, 0),
      new THREE.Vector3(3, 4, 25),
      new THREE.Vector3(0, 0, 50),
    ]);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Cyber Tube */}
      <mesh>
        <tubeGeometry args={[curve, 128, 7.5, 24, false]} />
        <meshBasicMaterial color={c1} wireframe opacity={0.35} transparent />
      </mesh>

      {/* Secondary Inner Wireframe Grid */}
      <mesh>
        <tubeGeometry args={[curve, 96, 7.2, 16, false]} />
        <meshBasicMaterial color={c2} wireframe opacity={0.25} transparent />
      </mesh>

      {/* High-Density Glowing Data Sparkles Streaming in Tunnel */}
      <Sparkles
        count={350}
        scale={[15, 15, 60]}
        size={8}
        speed={1.2 * speed}
        color={c1}
        opacity={0.9}
      />
      <Sparkles
        count={200}
        scale={[12, 12, 50]}
        size={6}
        speed={1.6 * speed}
        color={c2}
        opacity={0.8}
      />
    </group>
  );
};

// ------------------------------------------------------------------
// PRO-VFX MODULE 2: CINEMATIC DUST (Floating Stars, Sparkles & Bokeh)
// ------------------------------------------------------------------
const CinematicDustModule: React.FC<{ colors: string[]; speed: number; frame: number }> = ({ colors, speed, frame }) => {
  const [c1, c2] = colors;
  const t = (frame / 30) * 0.1 * speed;

  return (
    <group>
      {/* Deep Space Background Stars */}
      <Stars
        radius={100}
        depth={60}
        count={7000}
        factor={6}
        saturation={0}
        fade
        speed={1.5 * speed}
      />

      {/* Volumetric Floating Ambient Particle Dust */}
      <Sparkles
        count={500}
        scale={[28, 24, 28]}
        size={10}
        speed={0.3 * speed}
        noise={0.6}
        color={c1}
        opacity={0.85}
      />
      <Sparkles
        count={300}
        scale={[22, 18, 22]}
        size={7}
        speed={0.5 * speed}
        noise={0.4}
        color={c2}
        opacity={0.75}
      />

      {/* Floating Monolith Core with Smooth Hover */}
      <Float speed={1.8 * speed} rotationIntensity={1.2} floatIntensity={2}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[2.8, 0]} />
          <meshPhysicalMaterial
            color={c1}
            metalness={0.95}
            roughness={0.08}
            clearcoat={1.0}
            emissive={c2}
            emissiveIntensity={1.2}
          />
        </mesh>
      </Float>
    </group>
  );
};

// ------------------------------------------------------------------
// PRO-VFX MODULE 3: GLASS ABSTRACT (Apple-Grade Mesh Transmission)
// ------------------------------------------------------------------
const GlassAbstractModule: React.FC<{ colors: string[]; speed: number; frame: number }> = ({ colors, speed, frame }) => {
  const [c1, c2] = colors;
  const meshRef = useRef<THREE.Mesh>(null);
  const t = (frame / 30) * speed;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.45;
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.2;
    }
  });

  return (
    <group>
      {/* Floating Refractive Glass Hero Sculpture */}
      <Float speed={2.2 * speed} rotationIntensity={1.4} floatIntensity={2}>
        <mesh ref={meshRef} scale={1.2}>
          <torusKnotGeometry args={[2.5, 0.75, 220, 64]} />
          <MeshTransmissionMaterial
            ior={1.55}
            thickness={2.2}
            chromaticAberration={0.08}
            roughness={0.06}
            transmission={0.96}
            color={c1}
            attenuationColor={c2}
            attenuationDistance={1.2}
          />
        </mesh>
      </Float>

      {/* Internal Floating Glowing Nucleus */}
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color={c2} wireframe />
      </mesh>

      {/* Subtle Refractive Sparkle Dust */}
      <Sparkles
        count={180}
        scale={[16, 16, 16]}
        size={6}
        speed={0.4 * speed}
        color="#ffffff"
        opacity={0.8}
      />
    </group>
  );
};

// ------------------------------------------------------------------
// MASTER 3D PRO-VFX DIRECTOR CANVAS ROUTER
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: {
    engine3D?: {
      activeModule?: 'Data_Tunnel' | 'Cinematic_Dust' | 'Glass_Abstract';
      themeColors?: string[];
      speedMultiplier?: number;
      cameraMotion?: string;
    };
    commercialMarketCategory?: string;
    colors?: string[];
    [key: string]: any;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const e3d = data?.engine3D || {};
  let activeModule = e3d.activeModule;

  if (!activeModule) {
    const cat = data?.commercialMarketCategory || '';
    if (cat.includes('tunnel') || cat.includes('fiber') || cat.includes('data')) {
      activeModule = 'Data_Tunnel';
    } else if (cat.includes('dust') || cat.includes('star') || cat.includes('bio') || cat.includes('crypto')) {
      activeModule = 'Cinematic_Dust';
    } else {
      activeModule = 'Glass_Abstract';
    }
  }

  const rawColors = e3d.themeColors || data?.colors || ['#00f0ff', '#ff007f'];
  const colors: string[] = [rawColors[0] || '#00f0ff', rawColors[1] || '#ff007f'];
  const speed = typeof e3d.speedMultiplier === 'number' ? e3d.speedMultiplier : 0.8;
  const cameraMotion = e3d.cameraMotion || 'slow_pan';

  return (
    <ThreeErrorBoundary fallback={<mesh><sphereGeometry args={[2, 32, 32]} /><meshBasicMaterial color="#00f0ff" /></mesh>}>
      <color attach="background" args={['#020308']} />
      <fogExp2 attach="fog" color="#020308" density={0.018} />

      {/* Cinematic Camera Rig */}
      <VirtualDPCamera motion={cameraMotion} speed={speed} />

      {/* Studio Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 15, 8]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-12, -10, -10]} intensity={4.5} color={colors[1]} />
      <pointLight position={[12, 12, 10]} intensity={4.5} color={colors[0]} />
      <Environment preset="city" />

      {/* PRO-VFX MODULE ROUTER */}
      {activeModule === 'Data_Tunnel' && (
        <DataTunnelModule colors={colors} speed={speed} frame={frame} />
      )}
      {activeModule === 'Cinematic_Dust' && (
        <CinematicDustModule colors={colors} speed={speed} frame={frame} />
      )}
      {activeModule === 'Glass_Abstract' && (
        <GlassAbstractModule colors={colors} speed={speed} frame={frame} />
      )}
      {activeModule !== 'Data_Tunnel' && activeModule !== 'Cinematic_Dust' && activeModule !== 'Glass_Abstract' && (
        <GlassAbstractModule colors={colors} speed={speed} frame={frame} />
      )}

      {/* Heavy Cinematic Post-Processing Pipeline */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.25}
          luminanceSmoothing={0.85}
          intensity={2.4}
        />
        <ChromaticAberration offset={new THREE.Vector2(0.005, 0.005)} />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </ThreeErrorBoundary>
  );
};

export default MasterScene;
