import React, { useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. FINANCIAL / TECH 3D CANDLESTICK & DATA PILLAR GENERATOR
// -------------------------------------------------------------
const FinanceDataVisualizer = ({ palette, frame }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const candlesCount = 32;

  const candlesData = useMemo(() => {
    const items = [];
    let currentPrice = 50;

    for (let i = 0; i < candlesCount; i++) {
      const change = (Math.random() - 0.48) * 12;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 4;
      const low = Math.min(open, close) - Math.random() * 4;
      const isBullish = close >= open;

      items.push({
        x: (i - candlesCount / 2) * 1.1,
        open,
        close,
        high,
        low,
        isBullish,
        height: Math.max(Math.abs(close - open), 0.8),
        centerY: (open + close) / 2 - 50,
        highY: high - 50,
        lowY: low - 50,
      });

      currentPrice = close;
    }
    return items;
  }, [candlesCount]);

  // Floating background grid dots/particles
  const [gridPos, gridCols] = useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const bullCol = new THREE.Color("#10b981");
    const bearCol = new THREE.Color("#ef4444");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const c = Math.random() > 0.5 ? bullCol : bearCol;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      const t = frame * 0.008;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.25;
      groupRef.current.rotation.x = 0.1 + Math.cos(t * 0.3) * 0.05;
      groupRef.current.position.x = Math.sin(t * 0.4) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Candlesticks */}
      {candlesData.map((c, idx) => {
        const bodyColor = c.isBullish ? "#10b981" : "#ef4444";
        const bodyHeight = c.height * 0.5;
        const wickHeight = Math.max(c.highY - c.lowY, 1);

        return (
          <group key={idx} position={[c.x, c.centerY * 0.3, 0]}>
            {/* Candlestick Body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.7, bodyHeight, 0.7]} />
              <meshStandardMaterial
                color={bodyColor}
                emissive={bodyColor}
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Wick Line */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, wickHeight, 8]} />
              <meshBasicMaterial color={bodyColor} />
            </mesh>
          </group>
        );
      })}

      {/* Cyber Grid Base */}
      <gridHelper args={[60, 40, palette.primary, palette.secondary]} position={[0, -10, 0]} />

      {/* Data Ticker Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[gridCols, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.18} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};

// -------------------------------------------------------------
// 2. SCIENCE / CYBER ROTATING DOUBLE-HELIX DNA GENERATOR
// -------------------------------------------------------------
const DnaHelixVisualizer = ({ palette, frame }: any) => {
  const helixRef = useRef<THREE.Group>(null);
  const pairCount = 60;

  const helixNodes = useMemo(() => {
    const strand1: [number, number, number][] = [];
    const strand2: [number, number, number][] = [];
    const rungs: { p1: [number, number, number]; p2: [number, number, number] }[] = [];

    const radius = 4.5;
    const height = 35;

    for (let i = 0; i < pairCount; i++) {
      const t = i / pairCount;
      const y = (t - 0.5) * height;
      const angle = t * Math.PI * 8; // 4 full turns

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      strand1.push([x1, y, z1]);
      strand2.push([x2, y, z2]);

      if (i % 2 === 0) {
        rungs.push({ p1: [x1, y, z1], p2: [x2, y, z2] });
      }
    }
    return { strand1, strand2, rungs };
  }, [pairCount]);

  // Floating Cyber Cloud
  const [cloudPos, cloudCols] = useMemo(() => {
    const count = 12000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 5 + Math.random() * 15;
      pos[i * 3] = Math.cos(angle) * rad;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 2] = Math.sin(angle) * rad;

      const col = palette.primary.clone().lerp(palette.secondary, Math.random());
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return [pos, cols];
  }, [palette]);

  useFrame(() => {
    if (helixRef.current) {
      const t = frame * 0.012;
      helixRef.current.rotation.y = t;
      helixRef.current.rotation.z = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group ref={helixRef}>
      {/* Strand 1 Nucleotides */}
      {helixNodes.strand1.map((pos, idx) => (
        <mesh key={`s1-${idx}`} position={pos}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial
            color={palette.primary}
            emissive={palette.primary}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Strand 2 Nucleotides */}
      {helixNodes.strand2.map((pos, idx) => (
        <mesh key={`s2-${idx}`} position={pos}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial
            color={palette.secondary}
            emissive={palette.secondary}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Nucleotide Rung Bridges */}
      {helixNodes.rungs.map((rung, idx) => {
        const p1 = new THREE.Vector3(...rung.p1);
        const p2 = new THREE.Vector3(...rung.p2);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const distance = p1.distanceTo(p2);

        return (
          <mesh key={`rung-${idx}`} position={mid}>
            <cylinderGeometry args={[0.08, 0.08, distance, 8]} />
            <meshStandardMaterial
              color={palette.tertiary}
              emissive={palette.tertiary}
              emissiveIntensity={0.9}
            />
          </mesh>
        );
      })}

      {/* Surrounding Helix Code Cloud */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloudPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[cloudCols, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.2} vertexColors transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};

// -------------------------------------------------------------
// 3. ABSTRACT MORPHING MOLECULAR SPHERES GENERATOR
// -------------------------------------------------------------
const AbstractMoleculeVisualizer = ({ palette, frame }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = 28;

  const nodes = useMemo(() => {
    const items = [];
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8 + Math.random() * 6;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      items.push({
        basePos: new THREE.Vector3(x, y, z),
        size: 0.6 + Math.random() * 0.8,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, [nodeCount]);

  useFrame(() => {
    if (groupRef.current) {
      const t = frame * 0.01;
      groupRef.current.rotation.y = t * 0.6;
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Pulsing Glass Core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[4, 2]} />
        <meshPhysicalMaterial
          color={palette.primary}
          emissive={palette.primary}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
          thickness={1.5}
          wireframe
        />
      </mesh>

      {/* Orbiting Molecular Nodes */}
      {nodes.map((node, idx) => {
        const offset = Math.sin(frame * 0.02 * node.speed + node.phase) * 1.2;
        const currentPos = node.basePos.clone().multiplyScalar(1 + offset * 0.1);
        const col = idx % 2 === 0 ? palette.secondary : palette.tertiary;

        return (
          <group key={idx} position={currentPos}>
            <mesh>
              <sphereGeometry args={[node.size, 32, 32]} />
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={1.5}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// -------------------------------------------------------------
// MAIN MASTER SCENE ROUTER FOR THREE.JS
// -------------------------------------------------------------
export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const theme = data?.theme || "cyber";
  const customColor = data?.lighting?.colorTheme || "#00ffff";

  const palette = useMemo(() => {
    const primary = new THREE.Color(customColor);
    let secondary = new THREE.Color("#ff007f");
    let tertiary = new THREE.Color("#00f3ff");

    if (theme === "science") {
      secondary = new THREE.Color("#00f0ff");
      tertiary = new THREE.Color("#8b5cf6");
    } else if (theme === "finance") {
      secondary = new THREE.Color("#10b981");
      tertiary = new THREE.Color("#f59e0b");
    } else if (theme === "technology") {
      secondary = new THREE.Color("#3b82f6");
      tertiary = new THREE.Color("#d946ef");
    }

    return { primary, secondary, tertiary };
  }, [theme, customColor]);

  return (
    <>
      <color attach="background" args={["#020206"]} />
      <fog attach="fog" args={["#020206", 15, 50]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 15]} intensity={2.5} color={palette.primary} />
      <pointLight position={[-15, -10, -10]} intensity={3} color={palette.secondary} />
      <pointLight position={[0, 15, 10]} intensity={2} color={palette.tertiary} />

      {/* Select Procedural Generator based on Theme */}
      {(theme === "finance" || theme === "technology") && (
        <FinanceDataVisualizer palette={palette} frame={frame} />
      )}

      {(theme === "science" || theme === "cyber") && (
        <DnaHelixVisualizer palette={palette} frame={frame} />
      )}

      {theme !== "finance" && theme !== "technology" && theme !== "science" && theme !== "cyber" && (
        <AbstractMoleculeVisualizer palette={palette} frame={frame} />
      )}
    </>
  );
};
