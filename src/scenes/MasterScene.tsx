import React, { useMemo, useRef, Suspense } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Box, Grid, Text, PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CandlestickElements = ({ data }: any) => {
  const frame = useCurrentFrame();
  const color = data?.lighting?.colorTheme || data?.colorTheme || "#00ffcc";

  const candles = useMemo(() => {
    let arr = [];
    let currentPrice = 10;
    for (let i = 0; i < 50; i++) {
      const isUp = Math.random() > 0.45; 
      const bodySize = Math.random() * 2 + 0.5;
      const wickSize = bodySize + Math.random() * 2;
      currentPrice += isUp ? bodySize / 2 : -bodySize / 2;
      arr.push({ x: i * 1.5 - 35, y: currentPrice, bodySize, wickSize, isUp });
    }
    return arr;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = -(frame * 0.08) % 20;
    }
  });

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={2} />
      
      <Grid position={[0, -10, 0]} args={[150, 150]} cellColor={color} sectionColor={color} sectionThickness={1.5} fadeDistance={60} />

      <group ref={groupRef}>
        {candles.map((candle, i) => {
          const candleColor = candle.isUp ? "#00ffcc" : "#ff0044";
          return (
             <group key={i} position={[candle.x, candle.y, 0]}>
              <Box args={[0.08, candle.wickSize, 0.08]} position={[0, 0, 0]}>
                <meshBasicMaterial color={candleColor} />
              </Box>
              <Box args={[0.7, candle.bodySize, 0.7]} position={[0, 0, 0]}>
                <meshStandardMaterial color={candleColor} emissive={candleColor} emissiveIntensity={1.5} transparent opacity={0.85} />
              </Box>
              <Text position={[0, candle.bodySize + 1.5, 0]} fontSize={0.5} color={candleColor} anchorX="center" anchorY="middle">
                ${(candle.y * 100).toFixed(2)}
              </Text>
            </group>
          );
        })}
      </group>
      
      <Text position={[0, 8, -20]} fontSize={6} color={color} fillOpacity={0.15} outlineWidth={0.05} outlineColor={color} anchorX="center" anchorY="middle">
        {data?.title ? data.title.toUpperCase() : "MARKET ANALYSIS"}
      </Text>
    </group>
  );
};

export const MasterScene = ({ data, sceneData }: any) => {
  const mergedData = data || sceneData;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 3840, height: 2160, backgroundColor: '#020202', overflow: 'hidden' }}>
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
        style={{ width: 3840, height: 2160, display: 'block' }}
      >
        <Suspense fallback={null}>
          <CandlestickElements data={mergedData} />
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};
