import React, { Suspense } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { EliteVFX2D } from '../engine/2d/EliteVFX2D';
import { Premium3D } from '../engine/3d/Premium3D';

export const MasterScene = ({ data, renderType = "3d" }: any) => {
  const { colorTheme } = data || { colorTheme: "#ff0055" };
  const is3D = renderType === "3d";

  return (
    // CRITICAL FIX: Strict absolute pixel dimensions kill the ResizeObserver Infinite Loop!
    <div style={{ position: 'absolute', left: 0, top: 0, width: 3840, height: 2160, backgroundColor: '#020202', overflow: 'hidden' }}>
      <ThreeCanvas 
        width={3840} 
        height={2160} 
        camera={{ position: [0, 0, 18], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: "high-performance" }}
        style={{ width: 3840, height: 2160, display: 'block' }}
      >
        <Suspense fallback={null}>
          {is3D ? <Premium3D themeColor={colorTheme} /> : <EliteVFX2D themeColor={colorTheme} />}
        </Suspense>
      </ThreeCanvas>
    </div>
  );
};
