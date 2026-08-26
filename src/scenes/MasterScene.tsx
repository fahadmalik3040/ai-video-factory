import React, { Suspense } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Premium3D } from '../engine/3d/Premium3D';

export const MasterScene = ({ data, renderType = "3d" }: any) => {
  const { colorTheme } = data || { colorTheme: "#ff0055" };
  const is3D = renderType === "3d";

  return (
    <AbsoluteFill style={{ backgroundColor: '#020202' }}>
      {/* 4K CANVAS WITH SAFE WEBGL PARAMS (No PostProcessing Crash) */}
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        camera={{ position: [0, 0, 18], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          {is3D ? <Premium3D themeColor={colorTheme} /> : <EliteVFX2D themeColor={colorTheme} />}
        </Suspense>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
