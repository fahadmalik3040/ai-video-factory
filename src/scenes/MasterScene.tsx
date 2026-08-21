import React, { useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
// Solid Fallback Scene (ZERO Particles)
// ----------------------------------------------------
const SolidFallbackScene: React.FC<{ colors: string[] }> = ({ colors }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const c1 = colors[0] || "#00f0ff";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
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
        <icosahedronGeometry args={[4, 2]} />
        <meshPhysicalMaterial
          color={c1}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          wireframe={false}
        />
      </mesh>
    </group>
  );
};

// ----------------------------------------------------
// CORE A: Solid 3D Candlestick & Box Grid
// ----------------------------------------------------
const CandlestickCore: React.FC<{
  colors: string[];
  speed: number;
  complexity: number;
  movementStyle: string;
  metalness: number;
  roughness: number;
}> = ({ colors, speed, complexity, movementStyle, metalness, roughness }) => {
  const candleCount = 64;
  const bodyMeshRef = useRef<THREE.InstancedMesh>(null);
  const wickMeshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const chartData = useMemo(() => {
    return Array.from({ length: candleCount }, (_, i) => {
      const x = (i - candleCount / 2) * 0.6;
      const baseHeight = 1.0 + Math.sin(i * 0.3) * 0.8 + Math.cos(i * 0.7) * 0.5;
      const isBullish = i % 3 !== 0;
      return { x, baseHeight, isBullish };
    });
  }, [candleCount]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * 0.8;

    if (groupRef.current) {
      if (movementStyle === "vortex" || movementStyle === "macro_dolly_in") {
        groupRef.current.rotation.y = t * 0.4;
        groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      } else if (movementStyle === "orbital" || movementStyle === "orbit_slow") {
        groupRef.current.rotation.y = t * 0.5;
        groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.15;
      } else if (movementStyle === "expansion") {
        const s = 1.0 + Math.sin(t * 0.6) * 0.2;
        groupRef.current.scale.set(s, s, s);
      } else {
        groupRef.current.rotation.y = t * 0.25;
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
      }
    }

    if (bodyMeshRef.current && wickMeshRef.current) {
      for (let i = 0; i < candleCount; i++) {
        const item = chartData[i];
        const dynamicH = Math.max(0.4, item.baseHeight + Math.sin(t * 2 + i * 0.4) * 1.5 * complexity);
        const yOffset = Math.sin(t + i * 0.2) * 1.8;

        dummy.position.set(item.x, yOffset, Math.cos(i * 0.3 + t) * 1.2);
        dummy.scale.set(0.42, dynamicH, 0.42);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        bodyMeshRef.current.setMatrixAt(i, dummy.matrix);
        bodyMeshRef.current.setColorAt(i, item.isBullish ? c1 : c2);

        const wickHeight = dynamicH + 2.0;
        dummy.position.set(item.x, yOffset, Math.cos(i * 0.3 + t) * 1.2);
        dummy.scale.set(0.08, wickHeight, 0.08);
        dummy.updateMatrix();
        wickMeshRef.current.setMatrixAt(i, dummy.matrix);
        wickMeshRef.current.setColorAt(i, item.isBullish ? c1 : c2);
      }

      bodyMeshRef.current.instanceMatrix.needsUpdate = true;
      if (bodyMeshRef.current.instanceColor) bodyMeshRef.current.instanceColor.needsUpdate = true;

      wickMeshRef.current.instanceMatrix.needsUpdate = true;
      if (wickMeshRef.current.instanceColor) wickMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={bodyMeshRef} args={[undefined, undefined, candleCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </instancedMesh>

      <instancedMesh ref={wickMeshRef} args={[undefined, undefined, candleCount]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
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
// CORE B: Solid DNA Double Helix & Molecular Structure
// ----------------------------------------------------
const DnaMoleculesCore: React.FC<{
  colors: string[];
  speed: number;
  complexity: number;
  movementStyle: string;
  metalness: number;
  roughness: number;
}> = ({ colors, speed, complexity, movementStyle, metalness, roughness }) => {
  const nodeCount = 50;
  const totalNodes = nodeCount * 2;
  const rungsCount = nodeCount;

  const nodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const rungMeshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");
  const c3 = new THREE.Color(colors[2] || "#7000ff");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * 0.7;

    if (groupRef.current) {
      if (movementStyle === "vortex" || movementStyle === "macro_dolly_in") {
        groupRef.current.rotation.y = t * 0.7;
        groupRef.current.rotation.x = t * 0.3;
      } else if (movementStyle === "orbital" || movementStyle === "orbit_slow") {
        groupRef.current.rotation.y = t * 0.5;
        groupRef.current.rotation.z = t * 0.4;
      } else if (movementStyle === "expansion") {
        const s = 1.0 + Math.sin(t * 0.8) * 0.25;
        groupRef.current.scale.set(s, s, s);
        groupRef.current.rotation.y = t * 0.3;
      } else {
        groupRef.current.rotation.y = t * 0.4;
        groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.25;
      }
    }

    if (nodeMeshRef.current && rungMeshRef.current) {
      const radius = 3.2 * complexity;
      const heightSpread = 0.5;

      for (let i = 0; i < nodeCount; i++) {
        const angle = i * 0.28 + t;
        const y = (i - nodeCount / 2) * heightSpread;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;

        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        dummy.position.set(x1, y, z1);
        dummy.scale.set(0.6, 0.6, 0.6);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        nodeMeshRef.current.setMatrixAt(i, dummy.matrix);
        nodeMeshRef.current.setColorAt(i, c1);

        dummy.position.set(x2, y, z2);
        dummy.scale.set(0.6, 0.6, 0.6);
        dummy.updateMatrix();
        nodeMeshRef.current.setMatrixAt(i + nodeCount, dummy.matrix);
        nodeMeshRef.current.setColorAt(i + nodeCount, c2);

        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        dummy.position.set(midX, y, midZ);
        dummy.scale.set(0.12, radius * 2, 0.12);
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
        <sphereGeometry args={[1, 24, 24]} />
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
// CORE C: Solid Concentric Rings / Torus Lattice
// ----------------------------------------------------
const ConcentricRingsCore: React.FC<{
  colors: string[];
  speed: number;
  complexity: number;
  movementStyle: string;
  metalness: number;
  roughness: number;
}> = ({ colors, speed, complexity, movementStyle, metalness, roughness }) => {
  const ringCount = 12;
  const torusMeshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const c1 = new THREE.Color(colors[0] || "#00f0ff");
  const c2 = new THREE.Color(colors[1] || "#ff007f");
  const c3 = new THREE.Color(colors[2] || "#7000ff");

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * 0.7;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }

    if (torusMeshRef.current) {
      for (let i = 0; i < ringCount; i++) {
        const radius = (i + 1) * 1.1 * complexity;
        dummy.position.set(0, Math.sin(t * 1.5 + i * 0.4) * 0.8, 0);
        dummy.scale.set(radius, radius, radius);
        dummy.rotation.set(
          i % 2 === 0 ? t * 0.5 + i * 0.2 : -t * 0.4 - i * 0.2,
          i * 0.3,
          0
        );
        dummy.updateMatrix();
        torusMeshRef.current.setMatrixAt(i, dummy.matrix);

        let col = c1;
        if (i % 3 === 1) col = c2;
        else if (i % 3 === 2) col = c3;
        torusMeshRef.current.setColorAt(i, col);
      }
      torusMeshRef.current.instanceMatrix.needsUpdate = true;
      if (torusMeshRef.current.instanceColor) torusMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={torusMeshRef} args={[undefined, undefined, ringCount]}>
        <torusGeometry args={[1, 0.08, 16, 48]} />
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
// CORE D: Solid Abstract Displaced Geometric Waves
// ----------------------------------------------------
const AbstractSolidWavesCore: React.FC<{
  colors: string[];
  speed: number;
  complexity: number;
  movementStyle: string;
  metalness: number;
  roughness: number;
}> = ({ colors, speed, complexity, movementStyle, metalness, roughness }) => {
  const planeRef = useRef<THREE.Mesh>(null);
  const monolithRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const c1 = colors[0] || "#00f0ff";
  const c2 = colors[1] || "#ff007f";
  const c3 = colors[2] || "#7000ff";

  const monolithCount = 36;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const segments = 64;
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(24, 24, segments, segments), [segments]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * 0.75;

    if (groupRef.current) {
      if (movementStyle === "vortex" || movementStyle === "macro_dolly_in") {
        groupRef.current.rotation.z = t * 0.3;
        groupRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * 0.4) * 0.15;
      } else if (movementStyle === "orbital" || movementStyle === "orbit_slow") {
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.3;
        groupRef.current.rotation.y = t * 0.2;
      } else if (movementStyle === "expansion") {
        const s = 1.0 + Math.sin(t * 0.6) * 0.15;
        groupRef.current.scale.set(s, s, s);
      } else {
        groupRef.current.rotation.x = -Math.PI / 3.2 + Math.sin(t * 0.2) * 0.1;
        groupRef.current.rotation.z = t * 0.15;
      }
    }

    if (planeRef.current) {
      const positionAttr = planeRef.current.geometry.attributes.position;
      const count = positionAttr.count;

      for (let i = 0; i < count; i++) {
        const u = positionAttr.getX(i);
        const v = positionAttr.getY(i);
        const z =
          (Math.sin(u * 0.4 + t * 2) * Math.cos(v * 0.4 + t * 1.5) * 2.2 +
            Math.sin(Math.sqrt(u * u + v * v) * 0.6 - t * 3) * 1.2) *
          complexity;
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
        const row = Math.floor(i / 6) - 2.5;
        const col = (i % 6) - 2.5;
        const posX = col * 3.5;
        const posY = row * 3.5;
        const posZ = 2.5 + Math.sin(t * 2 + i * 0.5) * 1.8;

        dummy.position.set(posX, posY, posZ);
        dummy.scale.set(0.7, 0.7, 1.8 + Math.sin(t + i) * 0.8);
        dummy.rotation.set(t + i * 0.2, t * 0.5, 0);
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
          emissiveIntensity={0.3}
          metalness={metalness}
          roughness={roughness}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <instancedMesh ref={monolithRef} args={[undefined, undefined, monolithCount]}>
        <boxGeometry args={[1, 1, 1]} />
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
      colors?: string[];
      cameraSpeed?: number;
      bloomIntensity?: number;
      complexity?: number;
    };
    title?: string;
    solid_core?: string;
    solidCore?: string;
    sceneType?: string;
    particleShape?: string;
    movementStyle?: string;
    colors?: string[];
    cameraSpeed?: number;
    bloomIntensity?: number;
    complexity?: number;
  };
}

export const MasterScene: React.FC<MasterSceneProps> = ({ data }) => {
  const e3d = data?.engine3D;
  const layout = e3d?.layoutMath;
  const geom = e3d?.solidGeometry;
  const rawCore = data?.solid_core || data?.solidCore || data?.sceneType || '';

  // Determine active solid core
  let activeCore: 'candlestick_boxes' | 'dna_molecules' | 'concentric_rings' | 'abstract_solid_waves' = 'abstract_solid_waves';

  if (layout === 'concentric_rings' || geom === 'TorusGeometry' || rawCore.includes('ring') || rawCore.includes('torus')) {
    activeCore = 'concentric_rings';
  } else if (layout === 'grid' || geom === 'BoxGeometry' || rawCore === 'candlestick_boxes' || rawCore.includes('candlestick') || rawCore.includes('box') || rawCore.includes('finance')) {
    activeCore = 'candlestick_boxes';
  } else if (layout === 'dna_helix' || geom === 'SphereGeometry' || geom === 'CylinderGeometry' || rawCore === 'dna_molecules' || rawCore.includes('dna') || rawCore.includes('bio')) {
    activeCore = 'dna_molecules';
  } else {
    activeCore = 'abstract_solid_waves';
  }

  const movementStyle = e3d?.cameraMotion || data?.movementStyle || 'quantum_flow';
  const colors = Array.isArray(e3d?.colors) && e3d!.colors.length >= 2
    ? e3d!.colors
    : Array.isArray(data?.colors) && data.colors.length >= 2
    ? data.colors
    : ['#00f0ff', '#ff007f', '#7000ff'];

  const cameraSpeed = typeof e3d?.cameraSpeed === 'number' ? e3d.cameraSpeed : typeof data?.cameraSpeed === 'number' ? data.cameraSpeed : 1.5;
  const bloomIntensity = typeof e3d?.bloomIntensity === 'number' ? e3d.bloomIntensity : typeof data?.bloomIntensity === 'number' ? data.bloomIntensity : 2.0;
  const complexity = typeof e3d?.complexity === 'number' ? e3d.complexity : typeof data?.complexity === 'number' ? data.complexity : 1.0;
  const metalness = typeof e3d?.physicalMaterial?.metalness === 'number' ? e3d.physicalMaterial.metalness : 0.9;
  const roughness = typeof e3d?.physicalMaterial?.roughness === 'number' ? e3d.physicalMaterial.roughness : 0.1;

  return (
    <ThreeErrorBoundary fallback={<SolidFallbackScene colors={colors} />}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-15, -15, -10]} intensity={2.2} color={colors[1] || '#ff007f'} />
      <pointLight position={[15, 15, 10]} intensity={2.2} color={colors[0] || '#00f0ff'} />
      <Environment preset="city" />

      {activeCore === 'candlestick_boxes' && (
        <CandlestickCore
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          movementStyle={movementStyle}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {activeCore === 'dna_molecules' && (
        <DnaMoleculesCore
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          movementStyle={movementStyle}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {activeCore === 'concentric_rings' && (
        <ConcentricRingsCore
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          movementStyle={movementStyle}
          metalness={metalness}
          roughness={roughness}
        />
      )}

      {activeCore === 'abstract_solid_waves' && (
        <AbstractSolidWavesCore
          colors={colors}
          speed={cameraSpeed}
          complexity={complexity}
          movementStyle={movementStyle}
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
