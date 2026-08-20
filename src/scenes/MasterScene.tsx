import { useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MasterScene = ({ data }: any) => {
  const frame = useCurrentFrame();
  const vortexRef = useRef<THREE.Points>(null);
  const ambientRef = useRef<THREE.Points>(null);
  const ringsRef = useRef<THREE.Points>(null);

  const theme = data?.theme || "cyber";
  const customColor = data?.lighting?.colorTheme || data?.particles?.color || "#00ffff";

  // Dynamic Theme Color Palettes for Premium Stock Video Aesthetics
  const palette = useMemo(() => {
    const primary = new THREE.Color(customColor);
    let secondary = new THREE.Color("#ff007f"); // Neon Pink
    let tertiary = new THREE.Color("#7000ff");  // Ultra Violet

    if (theme === "science") {
      secondary = new THREE.Color("#00f0ff"); // Electric Cyan
      tertiary = new THREE.Color("#4f46e5");  // Deep Indigo
    } else if (theme === "cyber") {
      secondary = new THREE.Color("#ff0055"); // Neon Crimson
      tertiary = new THREE.Color("#00f3ff");  // Cyber Cyan
    } else if (theme === "finance") {
      secondary = new THREE.Color("#10b981"); // Crypto Emerald
      tertiary = new THREE.Color("#f59e0b");  // Radiant Gold
    } else if (theme === "technology") {
      secondary = new THREE.Color("#3b82f6"); // Azure Blue
      tertiary = new THREE.Color("#d946ef");  // Magenta Pulse
    }

    return { primary, secondary, tertiary };
  }, [theme, customColor]);

  // 1. Dense Swirling Cyber-Nebula Vortex (50,000 Particles)
  const [vortexPositions, vortexColors, vortexSizes] = useMemo(() => {
    const count = 50000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const p = i / count;
      const arm = i % 5; // 5-arm spiral galaxy structure
      const armAngle = (arm * Math.PI * 2) / 5;
      const angle = armAngle + p * Math.PI * 16;
      const radius = Math.pow(p, 0.5) * 22;

      // Spiral galaxy mathematics with turbulent displacement
      const spreadX = (Math.random() - 0.5) * (1 + radius * 0.2);
      const spreadY = (Math.random() - 0.5) * (2 + radius * 0.3) + Math.sin(angle * 3) * 1.5;
      const spreadZ = (Math.random() - 0.5) * (1 + radius * 0.2);

      pos[i * 3] = Math.cos(angle) * radius + spreadX;
      pos[i * 3 + 1] = spreadY;
      pos[i * 3 + 2] = Math.sin(angle) * radius + spreadZ;

      // Color gradient transition along spiral radius
      const mixRatio = Math.random();
      const colorSample = mixRatio < 0.5 
        ? palette.primary.clone().lerp(palette.secondary, mixRatio * 2)
        : palette.secondary.clone().lerp(palette.tertiary, (mixRatio - 0.5) * 2);

      cols[i * 3] = colorSample.r;
      cols[i * 3 + 1] = colorSample.g;
      cols[i * 3 + 2] = colorSample.b;

      sizes[i] = Math.random() * 0.35 + 0.1;
    }
    return [pos, cols, sizes];
  }, [palette]);

  // 2. Ambient Floating Bokeh & Energy Sparks (15,000 Particles)
  const [ambientPositions, ambientColors] = useMemo(() => {
    const count = 15000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const col = palette.primary.clone().lerp(palette.tertiary, Math.random());
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return [pos, cols];
  }, [palette]);

  // 3. Expanding Concentric Cyber Energy Rings (10,000 Particles)
  const [ringPositions, ringColors] = useMemo(() => {
    const count = 10000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const ringIndex = i % 4; // 4 distinct concentric rings
      const baseRadius = (ringIndex + 1) * 4.5;
      const angle = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(angle) * baseRadius + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * baseRadius + (Math.random() - 0.5) * 0.4;

      const col = palette.secondary.clone().lerp(palette.primary, ringIndex / 4);
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return [pos, cols];
  }, [palette]);

  // Frame-by-frame animation loops
  useFrame(() => {
    const t = frame * 0.005;

    // Vortex Swirl & Wave Motion
    if (vortexRef.current) {
      vortexRef.current.rotation.y = t * 0.8;
      vortexRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      vortexRef.current.rotation.z = Math.cos(t * 0.3) * 0.15;
    }

    // Ambient Floating Spark Field Drift
    if (ambientRef.current) {
      ambientRef.current.rotation.y = -t * 0.3;
      ambientRef.current.position.y = Math.sin(t * 0.7) * 1.5;
    }

    // Concentric Energy Ring Pulsing
    if (ringsRef.current) {
      ringsRef.current.rotation.y = t * 1.2;
      ringsRef.current.rotation.z = Math.sin(t * 0.4) * 0.3;
      const scale = 1 + Math.sin(t * 2) * 0.08;
      ringsRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* 1. Main Dense Cyber-Nebula Stream */}
      <points ref={vortexRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[vortexPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[vortexColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* 2. Floating Ambient Spark Field */}
      <points ref={ambientRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ambientPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[ambientColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* 3. Concentric Cyber Energy Rings */}
      <points ref={ringsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ringPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[ringColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};
