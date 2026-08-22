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
// VIRTUAL DP CAMERA RIG (Ultra Slow Cinematic Camera)
// ----------------------------------------------------
const VirtualDPCamera: React.FC<{ motionStyle?: string }> = ({ motionStyle = 'ultra_slow_continuous' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames = durationInFrames || 450;
  const progress = Math.min(Math.max(frame / totalFrames, 0), 1);

  const orbitCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 3, 28),
        new THREE.Vector3(18, 4, 20),
        new THREE.Vector3(25, 2, 0),
        new THREE.Vector3(18, -3, -20),
        new THREE.Vector3(0, 2, -28),
        new THREE.Vector3(-18, 4, -20),
        new THREE.Vector3(-25, 2, 0),
        new THREE.Vector3(-18, -2, 20),
        new THREE.Vector3(0, 3, 28),
      ],
      true
    );
  }, []);

  const dollyCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 34),
      new THREE.Vector3(1.5, 3.5, 26),
      new THREE.Vector3(-1.0, 2.0, 19),
      new THREE.Vector3(0.5, 1.0, 14),
      new THREE.Vector3(0, 0.5, 11),
    ]);
  }, []);

  useFrame(({ camera }) => {
    let targetPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(0, 0, 0);

    if (motionStyle === 'slow_orbit') {
      const orbitT = (progress * 0.75) % 1;
      targetPos = orbitCurve.getPointAt(orbitT);
      lookTarget.set(0, Math.sin(progress * Math.PI * 2) * 0.3, 0);
    } else {
      const easedT = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      targetPos = dollyCurve.getPointAt(easedT);
      lookTarget.set(0, Math.sin(progress * Math.PI) * 0.25, 0);
    }

    camera.position.copy(targetPos);
    camera.lookAt(lookTarget);
  });

  return null;
};

// ------------------------------------------------------------------
// SCENE 1: FIBER OPTIC DATA FLOW (High-Speed Glowing Spline Filaments)
// ------------------------------------------------------------------
const FiberOpticScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2, c3] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.15;

  const curves = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 6 + (i % 4) * 2;
      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * 16, Math.sin(angle) * 10, -20),
        new THREE.Vector3(Math.cos(angle + 1) * radius, Math.sin(angle + 1) * radius * 0.6, -5),
        new THREE.Vector3(Math.cos(angle + 2) * (radius * 0.7), Math.sin(angle + 2) * 4, 8),
        new THREE.Vector3(Math.cos(angle + 3) * (radius * 1.2), Math.sin(angle + 3) * 8, 20),
      ]);
    });
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.3;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {curves.map((curve, idx) => {
        const col = idx % 2 === 0 ? c1 : c2;
        return (
          <mesh key={idx}>
            <tubeGeometry args={[curve, 64, 0.12, 8, false]} />
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={2.8}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* Floating Data Pulses */}
      {Array.from({ length: 30 }).map((_, pIdx) => {
        const curve = curves[pIdx % curves.length];
        const progress = ((t * 0.8 + (pIdx * 0.033)) % 1);
        const pt = curve.getPointAt(progress);
        const pCol = pIdx % 2 === 0 ? c3 || '#ffffff' : '#ffffff';

        return (
          <mesh key={`p-${pIdx}`} position={pt}>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshBasicMaterial color={pCol} />
          </mesh>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------
// SCENE 2: CRYPTO BLOCKCHAIN NODES (Interconnected Laser Network Matrix)
// ------------------------------------------------------------------
const BlockchainNodesScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2, c3] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.12;
  const nodeCount = 36;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 9;
      return new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );
    });
  }, [nodeCount]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Node Spheres */}
      {nodes.map((node, i) => {
        const col = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
        const pulse = 1 + Math.sin(t * 1.5 + i) * 0.15;
        return (
          <group key={i} position={node} scale={pulse}>
            <mesh>
              <icosahedronGeometry args={[0.7, 0]} />
              <meshPhysicalMaterial
                color={col}
                metalness={0.9}
                roughness={0.1}
                clearcoat={1.0}
                emissive={col}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Laser Connections */}
      {nodes.map((n1, i) =>
        nodes.slice(i + 1).map((n2, j) => {
          const dist = n1.distanceTo(n2);
          if (dist > 6.5) return null;
          const points = [n1, n2];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <primitive key={`${i}-${j}`} object={new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: c1, opacity: 0.35, transparent: true }))} />
          );
        })
      )}
    </group>
  );
};

// ------------------------------------------------------------------
// SCENE 3: BIOTECH MICROSCOPIC (Organic DNA Double Helix & Molecules)
// ------------------------------------------------------------------
const BiotechMicroscopicScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2, c3] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.15;
  const count = 48;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = i * 0.3 + t * 0.5;
        const y = (i - count / 2) * 0.5;
        const r = 3.2;

        const x1 = Math.cos(angle) * r;
        const z1 = Math.sin(angle) * r;

        const x2 = Math.cos(angle + Math.PI) * r;
        const z2 = Math.sin(angle + Math.PI) * r;

        return (
          <group key={i}>
            {/* Strand 1 Sphere */}
            <mesh position={[x1, y, z1]}>
              <sphereGeometry args={[0.55, 24, 24]} />
              <meshPhysicalMaterial
                color={c1}
                metalness={0.2}
                roughness={0.1}
                transmission={0.8}
                thickness={1.0}
                clearcoat={1.0}
              />
            </mesh>

            {/* Strand 2 Sphere */}
            <mesh position={[x2, y, z2]}>
              <sphereGeometry args={[0.55, 24, 24]} />
              <meshPhysicalMaterial
                color={c2}
                metalness={0.2}
                roughness={0.1}
                transmission={0.8}
                thickness={1.0}
                clearcoat={1.0}
              />
            </mesh>

            {/* Connecting Bridge Cylinder */}
            <mesh position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} rotation={[0, -angle, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, r * 2, 16]} />
              <meshStandardMaterial color={c3 || '#ffffff'} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------
// SCENE 4: ABSTRACT CLEAN WAVES (Liquid Metal Sculptural Torus Waves)
// ------------------------------------------------------------------
const AbstractCleanWavesScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2, c3] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const knotRef = useRef<THREE.Mesh>(null);
  const t = (frame / 30) * 0.12;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.5;
      knotRef.current.rotation.y = t * 0.7;
      knotRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Liquid Metal Torus Knot */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[3.2, 0.9, 220, 64]} />
        <meshPhysicalMaterial
          color={c1}
          metalness={1.0}
          roughness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* Orbiting Concentric Fluid Wave Rings */}
      {Array.from({ length: 5 }).map((_, i) => {
        const radius = 6.5 + i * 2.2;
        return (
          <mesh key={i} rotation={[Math.PI / 3 + i * 0.2, i * 0.4, t * 0.2 * (i % 2 === 0 ? 1 : -1)]}>
            <torusGeometry args={[radius, 0.15, 16, 80]} />
            <meshPhysicalMaterial
              color={i % 2 === 0 ? c2 : c3}
              metalness={0.95}
              roughness={0.08}
              clearcoat={1.0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------
// SCENE 5: CYBERPUNK HACKER HUD (3D Volumetric Telemetry Hologram)
// ------------------------------------------------------------------
const CyberpunkHackerHUDScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2, c3] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.15;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const r = 3 + i * 1.5;
        const rotDir = i % 2 === 0 ? 1 : -1;
        return (
          <mesh key={i} rotation={[i * 0.35, t * 0.4 * rotDir, i * 0.2]}>
            <torusGeometry args={[r, 0.08, 12, 64]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? c1 : c2}
              emissive={i % 2 === 0 ? c1 : c2}
              emissiveIntensity={2.5}
            />
          </mesh>
        );
      })}

      {/* Central Quantum Reactor Core */}
      <mesh>
        <octahedronGeometry args={[2.0, 0]} />
        <meshPhysicalMaterial
          color={c3 || '#ffffff'}
          metalness={0.9}
          roughness={0.1}
          emissive={c1}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------
// SCENE 6: GLASSMORPHISM CORPORATE UI (Refractive 3D Glass Cards)
// ------------------------------------------------------------------
const GlassmorphismCorporateUIScene: React.FC<{ colors: string[]; frame: number }> = ({ colors, frame }) => {
  const [c1, c2] = colors;
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.12;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 5 }).map((_, i) => {
        const offsetAngle = (i / 5) * Math.PI * 2;
        const x = Math.cos(offsetAngle + t * 0.2) * 6;
        const z = Math.sin(offsetAngle + t * 0.2) * 6;
        const y = Math.sin(t * 0.8 + i) * 1.2;

        return (
          <group key={i} position={[x, y, z]} rotation={[0, -offsetAngle - t * 0.2 + Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[4.2, 2.8, 0.25]} />
              <meshPhysicalMaterial
                color={i % 2 === 0 ? c1 : c2}
                metalness={0.1}
                roughness={0.12}
                transmission={0.88}
                ior={1.5}
                thickness={1.5}
                clearcoat={1.0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Central Rotating Prism Accent */}
      <mesh>
        <dodecahedronGeometry args={[2.2, 0]} />
        <meshPhysicalMaterial
          color={c1}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------
// MASTER SCENE: STRICT COMMERCIAL CATEGORY ROUTER
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: {
    commercialMarketCategory?: string;
    commercialColors?: {
      primaryTechGlow?: string;
      backgroundAmbiance?: string;
      accentHighlight?: string;
    };
    cinematicVFX?: {
      bloomIntensity?: number;
      chromaticAberrationOffset?: number;
      noiseOpacity?: number;
    };
    environment?: {
      bgColor?: string;
      fogColor?: string;
      fogDensity?: number;
    };
    cameraDP?: {
      motionStyle?: string;
    };
    colors?: string[];
    engine3D?: any;
    [key: string]: any;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const category = data?.commercialMarketCategory || data?.engine3D?.layoutMath || 'fiber_optic_data_flow';

  const rawColors = data?.commercialColors;
  const colors: string[] = [
    rawColors?.primaryTechGlow || data?.colors?.[0] || data?.engine3D?.colors?.[0] || '#00f0ff',
    rawColors?.accentHighlight || data?.colors?.[1] || data?.engine3D?.colors?.[1] || '#ff007f',
    data?.colors?.[2] || data?.engine3D?.colors?.[2] || '#7000ff',
  ];

  const vfx = data?.cinematicVFX || {};
  const bloomIntensity = typeof vfx.bloomIntensity === 'number' ? vfx.bloomIntensity : 2.5;
  const caOffset = typeof vfx.chromaticAberrationOffset === 'number' ? vfx.chromaticAberrationOffset : 0.005;
  const noiseOpacity = typeof vfx.noiseOpacity === 'number' ? vfx.noiseOpacity : 0.04;

  const env = data?.environment || {};
  const fogColor = env.fogColor || rawColors?.backgroundAmbiance || '#03040a';
  const fogDensity = typeof env.fogDensity === 'number' ? env.fogDensity : 0.02;

  const camMotion = data?.cameraDP?.motionStyle || 'ultra_slow_continuous';

  return (
    <ThreeErrorBoundary fallback={<mesh><sphereGeometry args={[2, 32, 32]} /><meshBasicMaterial color="#00f0ff" /></mesh>}>
      <fogExp2 attach="fog" color={fogColor} density={fogDensity} />
      <VirtualDPCamera motionStyle={camMotion} />

      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 8]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-15, -12, -10]} intensity={4.5} color={colors[1]} />
      <pointLight position={[15, 12, 10]} intensity={4.5} color={colors[0]} />
      <Environment preset="city" />

      {/* STRICT COMMERCIAL CATEGORY VISUAL ROUTER */}
      {category === 'fiber_optic_data_flow' && <FiberOpticScene colors={colors} frame={frame} />}
      {category === 'crypto_blockchain_nodes' && <BlockchainNodesScene colors={colors} frame={frame} />}
      {category === 'biotech_microscopic' && <BiotechMicroscopicScene colors={colors} frame={frame} />}
      {category === 'abstract_clean_waves' && <AbstractCleanWavesScene colors={colors} frame={frame} />}
      {category === 'cyberpunk_hacker_hud' && <CyberpunkHackerHUDScene colors={colors} frame={frame} />}
      {category === 'glassmorphism_corporate_ui' && <GlassmorphismCorporateUIScene colors={colors} frame={frame} />}
      {category !== 'fiber_optic_data_flow' &&
        category !== 'crypto_blockchain_nodes' &&
        category !== 'biotech_microscopic' &&
        category !== 'abstract_clean_waves' &&
        category !== 'cyberpunk_hacker_hud' &&
        category !== 'glassmorphism_corporate_ui' && (
          <FiberOpticScene colors={colors} frame={frame} />
        )}

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
