import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
// DYNAMIC GEOMETRY SWITCHER (Zero Lazy Hardcoding)
// ----------------------------------------------------
export const DynamicGeometry: React.FC<{ solidGeometry?: string; scale?: number }> = ({ solidGeometry, scale = 1 }) => {
  switch (solidGeometry) {
    case 'SphereGeometry':
      return <sphereGeometry args={[1 * scale, 32, 32]} />;
    case 'TorusGeometry':
      return <torusGeometry args={[1 * scale, 0.35 * scale, 16, 64]} />;
    case 'CylinderGeometry':
      return <cylinderGeometry args={[0.8 * scale, 0.8 * scale, 2 * scale, 32]} />;
    case 'IcosahedronGeometry':
      return <icosahedronGeometry args={[1.2 * scale, 0]} />;
    case 'BoxGeometry':
    default:
      return <boxGeometry args={[1 * scale, 1 * scale, 1 * scale]} />;
  }
};

// ----------------------------------------------------
// VIRTUAL DP CAMERA RIG (Safe Framing & Zero Clipping)
// ----------------------------------------------------
interface VirtualDPCameraProps {
  cameraPath?: 'slow_orbit' | 'smooth_dolly_in' | 'macro_pan_up';
  pacing?: string;
  focusDistance?: number;
}

const VirtualDPCamera: React.FC<VirtualDPCameraProps> = ({
  cameraPath = 'slow_orbit',
  focusDistance = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const totalFrames = durationInFrames || 450;
  const progress = Math.min(Math.max(frame / totalFrames, 0), 1);

  const orbitCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 3, 34),
        new THREE.Vector3(22, 4, 24),
        new THREE.Vector3(30, 2, 0),
        new THREE.Vector3(22, -3, -24),
        new THREE.Vector3(0, 1, -34),
        new THREE.Vector3(-22, 4, -24),
        new THREE.Vector3(-30, 1, 0),
        new THREE.Vector3(-22, -2, 24),
        new THREE.Vector3(0, 3, 34),
      ],
      true
    );
  }, []);

  const dollyCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 42),
      new THREE.Vector3(2.0, 3.5, 32),
      new THREE.Vector3(-1.0, 2.0, 24),
      new THREE.Vector3(0.5, 1.0, 18),
      new THREE.Vector3(0, 0.5, 14 + focusDistance),
    ]);
  }, [focusDistance]);

  const panUpCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, -10, 30),
      new THREE.Vector3(-4, -4, 28),
      new THREE.Vector3(0, 2, 26),
      new THREE.Vector3(4, 7, 28),
      new THREE.Vector3(8, 11, 30),
    ]);
  }, []);

  useFrame(({ camera }) => {
    let targetPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(0, 0, 0);

    if (cameraPath === 'smooth_dolly_in') {
      const easedT = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      targetPos = dollyCurve.getPointAt(easedT);
      lookTarget.set(0, Math.sin(progress * Math.PI) * 0.3, 0);
    } else if (cameraPath === 'macro_pan_up') {
      const easedT = progress;
      targetPos = panUpCurve.getPointAt(easedT);
      lookTarget.set(0, progress * 3 - 1.5, 0);
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

// ----------------------------------------------------
// Solid Fallback Scene (ZERO Particles)
// ----------------------------------------------------
const SolidFallbackScene: React.FC<{ colors: string[] }> = ({ colors }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frame = useCurrentFrame();
  const c1 = colors[0] || "#00f0ff";

  useFrame(() => {
    const t = (frame / 30) * 0.1;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.4;
      meshRef.current.rotation.y = t * 0.6;
    }
  });

  return (
    <group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[3, 2]} />
        <meshPhysicalMaterial
          color={c1}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// CORE A: Dynamic 3D Solid Grid (Candlesticks / Cubes / Spheres)
// ----------------------------------------------------
const DynamicGridCore: React.FC<{
  solidGeometry: string;
  colors: string[];
  speed: number;
  complexity: number;
  metalness: number;
  roughness: number;
}> = ({ solidGeometry, colors, speed, complexity, metalness, roughness }) => {
  const count = 48;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");
  const c3 = new THREE.Color(colors[2] || "#7000ff");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const gridData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const col = i % 8 - 3.5;
      const row = Math.floor(i / 8) - 2.5;
      const x = col * 2.2;
      const z = row * 2.2;
      const baseHeight = 0.8 + Math.sin(i * 0.4) * 0.5;
      return { x, z, baseHeight };
    });
  }, [count]);

  useFrame(() => {
    const t = (frame / 30) * 0.12 * speed;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.05;
    }

    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const item = gridData[i];
        const dynamicH = Math.max(0.3, item.baseHeight + Math.sin(t * 1.5 + i * 0.3) * 0.8 * Math.min(complexity, 1.2));
        const yOffset = Math.sin(t * 0.8 + i * 0.2) * 0.6;

        dummy.position.set(item.x, yOffset, item.z);
        if (solidGeometry === 'BoxGeometry') {
          dummy.scale.set(0.65, dynamicH * 1.8, 0.65);
        } else if (solidGeometry === 'CylinderGeometry') {
          dummy.scale.set(0.5, dynamicH * 1.5, 0.5);
        } else {
          dummy.scale.set(0.7, 0.7, 0.7);
        }
        dummy.rotation.set(t * 0.2 + i * 0.1, t * 0.3, 0);
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
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <DynamicGeometry solidGeometry={solidGeometry} scale={1.0} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </instancedMesh>
    </group>
  );
};

// ----------------------------------------------------
// CORE B: Dynamic 3D Helix / Molecular Structure
// ----------------------------------------------------
const DynamicHelixCore: React.FC<{
  solidGeometry: string;
  colors: string[];
  speed: number;
  complexity: number;
  metalness: number;
  roughness: number;
}> = ({ solidGeometry, colors, speed, complexity, metalness, roughness }) => {
  const nodeCount = 44;
  const totalNodes = nodeCount * 2;
  const rungsCount = nodeCount;

  const nodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const rungMeshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");
  const c3 = new THREE.Color(colors[2] || "#7000ff");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const t = (frame / 30) * 0.15 * speed;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.08;
    }

    if (nodeMeshRef.current && rungMeshRef.current) {
      const radius = 2.5 * Math.min(complexity, 1.1);
      const heightSpread = 0.38;

      for (let i = 0; i < nodeCount; i++) {
        const angle = i * 0.28 + t * 0.8;
        const y = (i - nodeCount / 2) * heightSpread;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;

        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        dummy.position.set(x1, y, z1);
        dummy.scale.set(0.5, 0.5, 0.5);
        dummy.rotation.set(0, angle, 0);
        dummy.updateMatrix();
        nodeMeshRef.current.setMatrixAt(i, dummy.matrix);
        nodeMeshRef.current.setColorAt(i, c1);

        dummy.position.set(x2, y, z2);
        dummy.scale.set(0.5, 0.5, 0.5);
        dummy.rotation.set(0, angle + Math.PI, 0);
        dummy.updateMatrix();
        nodeMeshRef.current.setMatrixAt(i + nodeCount, dummy.matrix);
        nodeMeshRef.current.setColorAt(i + nodeCount, c2);

        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        dummy.position.set(midX, y, midZ);
        dummy.scale.set(0.09, radius * 2, 0.09);
        dummy.rotation.set(0, -angle, Math.PI / 2);
        dummy.updateMatrix();
        rungMeshRef.current.setMatrixAt(i, dummy.matrix);
        rungMeshRef.current.setColorAt(i, c3);
      }

      nodeMeshRef.current.instanceMatrix.needsUpdate = true;
      if (nodeMeshRef.current.instanceColor) nodeMeshRef.current.instanceColor.needsUpdate = true;

      rungMeshRef.current.instanceMatrix.needsUpdate = true;
      if (rungMeshRef.current.instanceColor) rungMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={nodeMeshRef} args={[undefined, undefined, totalNodes]}>
        <DynamicGeometry solidGeometry={solidGeometry} scale={0.8} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </instancedMesh>

      <instancedMesh ref={rungMeshRef} args={[undefined, undefined, rungsCount]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </instancedMesh>
    </group>
  );
};

// ----------------------------------------------------
// CORE C: Dynamic 3D Concentric Rings / Geometry Gyroscope
// ----------------------------------------------------
const DynamicConcentricCore: React.FC<{
  solidGeometry: string;
  colors: string[];
  speed: number;
  complexity: number;
  metalness: number;
  roughness: number;
}> = ({ solidGeometry, colors, speed, complexity, metalness, roughness }) => {
  const ringCount = 12;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");
  const c3 = new THREE.Color(colors[2] || "#7000ff");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const t = (frame / 30) * 0.12 * speed;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.08;
    }

    if (meshRef.current) {
      for (let i = 0; i < ringCount; i++) {
        const radius = (i + 1) * 0.75 * Math.min(complexity, 1.1);
        dummy.position.set(0, Math.sin(t * 0.8 + i * 0.3) * 0.4, 0);
        dummy.scale.set(radius, radius, radius);
        dummy.rotation.set(
          i % 2 === 0 ? t * 0.25 + i * 0.12 : -t * 0.2 - i * 0.12,
          i * 0.15,
          i * 0.1
        );
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
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, ringCount]}>
        <DynamicGeometry solidGeometry={solidGeometry || 'TorusGeometry'} scale={1.0} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </instancedMesh>
    </group>
  );
};

// ----------------------------------------------------
// CORE D: Dynamic Displaced Wave Plane & Monolith Array
// ----------------------------------------------------
const DynamicWaveCore: React.FC<{
  solidGeometry: string;
  colors: string[];
  speed: number;
  complexity: number;
  metalness: number;
  roughness: number;
}> = ({ solidGeometry, colors, speed, complexity, metalness, roughness }) => {
  const planeRef = useRef<THREE.Mesh>(null);
  const monolithRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();

  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#ff007f";
  const c3 = colors[2] || "#7000ff";

  const monolithCount = 25;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const segments = 64;
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(16, 16, segments, segments), [segments]);

  useFrame(() => {
    const t = (frame / 30) * 0.12 * speed;

    if (groupRef.current) {
      groupRef.current.rotation.x = -Math.PI / 3.4 + Math.sin(t * 0.12) * 0.04;
      groupRef.current.rotation.z = t * 0.06;
    }

    if (planeRef.current) {
      const positionAttr = planeRef.current.geometry.attributes.position;
      const count = positionAttr.count;

      for (let i = 0; i < count; i++) {
        const u = positionAttr.getX(i);
        const v = positionAttr.getY(i);
        const z =
          (Math.sin(u * 0.35 + t * 0.8) * Math.cos(v * 0.35 + t * 0.6) * 1.2 +
            Math.sin(Math.sqrt(u * u + v * v) * 0.45 - t * 1.0) * 0.6) *
          Math.min(complexity, 1.1);
        positionAttr.setZ(i, z);
      }
      positionAttr.needsUpdate = true;
      planeRef.current.geometry.computeVertexNormals();
    }

    if (monolithRef.current) {
      const col1 = new THREE.Color(c1);
      const col2 = new THREE.Color(c2);
      const col3 = new THREE.Color(c3);

      for (let i = 0; i < monolithCount; i++) {
        const row = Math.floor(i / 5) - 2;
        const col = (i % 5) - 2;
        const posX = col * 2.6;
        const posY = row * 2.6;
        const posZ = 1.6 + Math.sin(t * 0.8 + i * 0.4) * 0.8;

        dummy.position.set(posX, posY, posZ);
        dummy.scale.set(0.6, 0.6, 0.6 + Math.sin(t * 0.6 + i) * 0.4);
        dummy.rotation.set(t * 0.4 + i * 0.1, t * 0.2, 0);
        dummy.updateMatrix();

        monolithRef.current.setMatrixAt(i, dummy.matrix);
        let chosenColor = col1;
        if (i % 3 === 1) chosenColor = col2;
        else if (i % 3 === 2) chosenColor = col3;
        monolithRef.current.setColorAt(i, chosenColor);
      }
      monolithRef.current.instanceMatrix.needsUpdate = true;
      if (monolithRef.current.instanceColor) monolithRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={planeRef} geometry={planeGeometry}>
        <meshPhysicalMaterial
          color={c1}
          emissive={c2}
          emissiveIntensity={0.25}
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <instancedMesh ref={monolithRef} args={[undefined, undefined, monolithCount]}>
        <DynamicGeometry solidGeometry={solidGeometry} scale={0.7} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </instancedMesh>
    </group>
  );
};

// ----------------------------------------------------
// Master Scene Router & Postprocessing Pipeline
// ----------------------------------------------------
interface MasterSceneProps {
  data: {
    seoPackage?: {
      title?: string;
      description?: string;
      seoTags?: string[];
    };
    engine3D?: {
      solidGeometry?: 'BoxGeometry' | 'SphereGeometry' | 'CylinderGeometry' | 'TorusGeometry';
      layoutMath?: 'grid' | 'concentric_rings' | 'dna_helix' | 'wave_plane';
      physicalMaterial?: { metalness?: number; roughness?: number };
      cameraMotion?: 'orbit_slow' | 'macro_dolly_in';
      cinematographyDP?: {
        cameraPath?: 'slow_orbit' | 'smooth_dolly_in' | 'macro_pan_up';
        pacing?: string;
        focusDistance?: number;
      };
      colors?: string[];
      cameraSpeed?: number;
      bloomIntensity?: number;
      complexity?: number;
    };
    title?: string;
    solid_core?: string;
    solidCore?: string;
    sceneType?: string;
    colors?: string[];
    cameraSpeed?: number;
    bloomIntensity?: number;
    complexity?: number;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const e3d = data?.engine3D;
  const layout = e3d?.layoutMath || 'wave_plane';
  const geom = e3d?.solidGeometry || 'BoxGeometry';

  const dpConfig = e3d?.cinematographyDP;
  let cameraPath: 'slow_orbit' | 'smooth_dolly_in' | 'macro_pan_up' = dpConfig?.cameraPath || 'slow_orbit';
  if (!dpConfig?.cameraPath && e3d?.cameraMotion === 'macro_dolly_in') {
    cameraPath = 'smooth_dolly_in';
  }

  const colors = Array.isArray(e3d?.colors) && e3d!.colors.length >= 2
    ? e3d!.colors
    : Array.isArray(data?.colors) && data.colors.length >= 2
    ? data.colors
    : ['#00f0ff', '#ff007f', '#7000ff'];

  const cameraSpeed = typeof e3d?.cameraSpeed === 'number' ? e3d.cameraSpeed : typeof data?.cameraSpeed === 'number' ? data.cameraSpeed : 1.0;
  const bloomIntensity = typeof e3d?.bloomIntensity === 'number' ? e3d.bloomIntensity : typeof data?.bloomIntensity === 'number' ? data.bloomIntensity : 2.0;
  const complexity = typeof e3d?.complexity === 'number' ? e3d.complexity : typeof data?.complexity === 'number' ? data.complexity : 1.0;
  const metalness = typeof e3d?.physicalMaterial?.metalness === 'number' ? e3d.physicalMaterial.metalness : 0.9;
  const roughness = typeof e3d?.physicalMaterial?.roughness === 'number' ? e3d.physicalMaterial.roughness : 0.1;

  return (
    <ThreeErrorBoundary fallback={<SolidFallbackScene colors={colors} />}>
      <VirtualDPCamera
        cameraPath={cameraPath}
        pacing={dpConfig?.pacing || 'extremely_slow_and_cinematic'}
        focusDistance={dpConfig?.focusDistance || 0}
      />

      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-15, -15, -10]} intensity={2.2} color={colors[1] || '#ff007f'} />
      <pointLight position={[15, 15, 10]} intensity={2.2} color={colors[0] || '#00f0ff'} />
      <Environment preset="city" />

      {layout === 'grid' && (
        <DynamicGridCore
          solidGeometry={geom}
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {layout === 'dna_helix' && (
        <DynamicHelixCore
          solidGeometry={geom}
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {layout === 'concentric_rings' && (
        <DynamicConcentricCore
          solidGeometry={geom}
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {layout === 'wave_plane' && (
        <DynamicWaveCore
          solidGeometry={geom}
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
          intensity={bloomIntensity}
        />
      </EffectComposer>
    </ThreeErrorBoundary>
  );
};

export default MasterScene;
