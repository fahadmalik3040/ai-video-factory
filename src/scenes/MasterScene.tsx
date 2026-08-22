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
// SWARM CAMERA RIG (Agent 4 Spline Execution)
// ----------------------------------------------------
const SwarmCinematographerCamera: React.FC<{
  splinePoints?: Array<[number, number, number]>;
  motionStyle?: string;
  lensFOV?: number;
}> = ({ splinePoints, motionStyle }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames = durationInFrames || 450;
  const progress = Math.min(Math.max(frame / totalFrames, 0), 1);

  const curve = useMemo(() => {
    if (Array.isArray(splinePoints) && splinePoints.length >= 3) {
      const vecPoints = splinePoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      return new THREE.CatmullRomCurve3(vecPoints, false);
    }
    // Default cinematic dolly curve
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 34),
      new THREE.Vector3(1.5, 3.5, 26),
      new THREE.Vector3(-1.0, 2.0, 19),
      new THREE.Vector3(0.5, 1.0, 14),
      new THREE.Vector3(0, 0.5, 11),
    ]);
  }, [splinePoints]);

  useFrame(({ camera }) => {
    const easedT = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    const targetPos = curve.getPointAt(easedT);
    const lookTarget = new THREE.Vector3(0, Math.sin(progress * Math.PI) * 0.25, 0);

    camera.position.copy(targetPos);
    camera.lookAt(lookTarget);
  });

  return null;
};

// ------------------------------------------------------------------
// SWARM INSTANCED PARTICLE ENGINE (Agent 2 Math TD Execution)
// ------------------------------------------------------------------
const SwarmInstancedMathEngine: React.FC<{
  mathTD: any;
  pbrMaterial: any;
  colors: string[];
  frame: number;
}> = ({ mathTD, pbrMaterial, colors, frame }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = mathTD?.particleMath?.instancedCount || 180;
  const spreadRadius = mathTD?.particleMath?.spreadRadius || 12;
  const rotFreq = mathTD?.particleMath?.rotationalFrequency || 0.15;
  const velocity = mathTD?.particleMath?.velocityVector || [0.2, 0.5, 0.1];

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = (frame / 30) * rotFreq;

  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 4 + Math.random() * (spreadRadius - 4);
      return {
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(phi),
        scale: 0.2 + Math.random() * 0.35,
        speedMultiplier: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count, spreadRadius]);

  const c1 = new THREE.Color(colors[0] || '#00f0ff');
  const c2 = new THREE.Color(colors[1] || '#ff007f');
  const c3 = new THREE.Color(colors[2] || '#7000ff');

  useFrame(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const pt = points[i];
        const dispY = pt.y + Math.sin(t * velocity[1] * pt.speedMultiplier + pt.phase) * 1.2;
        const dispX = pt.x + Math.cos(t * velocity[0] * pt.speedMultiplier + pt.phase) * 0.8;
        const dispZ = pt.z + Math.sin(t * velocity[2] * pt.speedMultiplier) * 0.8;

        dummy.position.set(dispX, dispY, dispZ);
        dummy.scale.set(pt.scale, pt.scale, pt.scale);
        dummy.rotation.set(t * pt.speedMultiplier, t * 0.5 * pt.speedMultiplier, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        let col = c1;
        if (i % 3 === 1) col = c2;
        else if (i % 3 === 2) col = c3;
        meshRef.current.setColorAt(i, col);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={pbrMaterial?.baseColor || colors[0]}
        metalness={pbrMaterial?.metalness ?? 0.95}
        roughness={pbrMaterial?.roughness ?? 0.08}
        clearcoat={pbrMaterial?.clearcoat ?? 1.0}
        emissive={pbrMaterial?.emissiveHex || colors[1]}
        emissiveIntensity={pbrMaterial?.emissiveIntensity ?? 1.5}
      />
    </instancedMesh>
  );
};

// ------------------------------------------------------------------
// SWARM HERO STRUCTURES (Agent 2 Geometry Mesh Type)
// ------------------------------------------------------------------
const SwarmHeroCore: React.FC<{
  meshType: string;
  pbrMaterial: any;
  colors: string[];
  frame: number;
}> = ({ meshType, pbrMaterial, colors, frame }) => {
  const [c1, c2, c3] = colors;
  const knotRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const t = (frame / 30) * 0.15;

  useFrame(() => {
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.6;
      knotRef.current.rotation.y = t * 0.8;
      knotRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
    }
  });

  const material = useMemo(() => {
    return (
      <meshPhysicalMaterial
        color={pbrMaterial?.baseColor || c1}
        metalness={pbrMaterial?.metalness ?? 0.95}
        roughness={pbrMaterial?.roughness ?? 0.06}
        transmission={pbrMaterial?.transmission ?? 0.0}
        clearcoat={pbrMaterial?.clearcoat ?? 1.0}
        emissive={pbrMaterial?.emissiveHex || c2}
        emissiveIntensity={pbrMaterial?.emissiveIntensity ?? 1.2}
      />
    );
  }, [pbrMaterial, c1, c2]);

  if (meshType === 'FiberSplines') {
    return (
      <group ref={groupRef}>
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle) * 14, Math.sin(angle) * 8, -15),
            new THREE.Vector3(Math.cos(angle + 1) * 6, Math.sin(angle + 1) * 4, 0),
            new THREE.Vector3(Math.cos(angle + 2) * 10, Math.sin(angle + 2) * 6, 15),
          ]);
          return (
            <mesh key={i}>
              <tubeGeometry args={[curve, 48, 0.14, 8, false]} />
              {material}
            </mesh>
          );
        })}
      </group>
    );
  }

  if (meshType === 'BiotechDNA') {
    return (
      <group ref={groupRef}>
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = i * 0.32 + t * 0.6;
          const y = (i - 18) * 0.55;
          const r = 3.2;
          const x1 = Math.cos(angle) * r;
          const z1 = Math.sin(angle) * r;
          const x2 = Math.cos(angle + Math.PI) * r;
          const z2 = Math.sin(angle + Math.PI) * r;

          return (
            <group key={i}>
              <mesh position={[x1, y, z1]}>
                <sphereGeometry args={[0.5, 24, 24]} />
                {material}
              </mesh>
              <mesh position={[x2, y, z2]}>
                <sphereGeometry args={[0.5, 24, 24]} />
                {material}
              </mesh>
              <mesh position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} rotation={[0, -angle, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, r * 2, 12]} />
                <meshBasicMaterial color={c3 || '#ffffff'} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  // Default: TorusKnot
  return (
    <mesh ref={knotRef} scale={1.2}>
      <torusKnotGeometry args={[2.8, 0.75, 200, 48]} />
      {material}
    </mesh>
  );
};

// ------------------------------------------------------------------
// MASTER 3D SWARM SCENE: PURE EXECUTION ENGINE
// ------------------------------------------------------------------
export interface MasterSceneProps {
  data: any;
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const mathTD = data?.mathTD || {};
  const meshType = mathTD.geometryMeshType || data?.engine3D?.solidGeometry || 'TorusKnot';
  const pbrMaterial = data?.materialLighting?.pbrMaterial || data?.engine3D?.physicalMaterial || {};
  const lighting = data?.materialLighting?.cinematicLighting || {};
  const cinematography = data?.cinematography?.cameraDP || {};
  const vfx = data?.cinematicVFX || {};

  const colors: string[] = Array.isArray(data?.colors) && data.colors.length >= 2
    ? data.colors
    : [lighting.ambientHex || '#00f0ff', lighting.fillLightHex || '#ff007f', lighting.rimLightHex || '#7000ff'];

  const bloomIntensity = typeof vfx.bloomIntensity === 'number' ? vfx.bloomIntensity : 2.5;
  const caOffset = typeof vfx.chromaticAberrationOffset === 'number' ? vfx.chromaticAberrationOffset : 0.005;
  const noiseOpacity = typeof vfx.noiseOpacity === 'number' ? vfx.noiseOpacity : 0.035;

  const keyPos = lighting.keyLightPosition || [10, 15, 8];

  return (
    <ThreeErrorBoundary fallback={<mesh><sphereGeometry args={[2, 32, 32]} /><meshBasicMaterial color="#00f0ff" /></mesh>}>
      <fogExp2 attach="fog" color="#03040a" density={0.02} />

      {/* Swarm Virtual DP Camera Rig */}
      <SwarmCinematographerCamera
        splinePoints={cinematography.splinePoints}
        motionStyle={cinematography.motionStyle}
        lensFOV={cinematography.lensFOV}
      />

      {/* Swarm 3-Point Cinematic Lighting Rig */}
      <ambientLight intensity={lighting.ambientIntensity ?? 1.2} color={lighting.ambientHex || '#ffffff'} />
      <directionalLight position={keyPos} intensity={lighting.keyLightIntensity ?? 2.8} color={lighting.keyLightHex || '#ffffff'} />
      <pointLight position={[-15, -12, -10]} intensity={lighting.fillLightIntensity ?? 4.2} color={lighting.fillLightHex || colors[1]} />
      <pointLight position={[15, 12, 10]} intensity={lighting.rimLightIntensity ?? 3.8} color={lighting.rimLightHex || colors[0]} />
      <Environment preset="city" />

      {/* Hero Structure */}
      <SwarmHeroCore
        meshType={meshType}
        pbrMaterial={pbrMaterial}
        colors={colors}
        frame={frame}
      />

      {/* Instanced Physics Particle Cloud */}
      <SwarmInstancedMathEngine
        mathTD={mathTD}
        pbrMaterial={pbrMaterial}
        colors={colors}
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
