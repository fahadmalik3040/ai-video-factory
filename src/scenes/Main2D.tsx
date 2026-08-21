import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, AbsoluteFill } from 'remotion';

export interface Visual2DElement {
  type: 'data_ring' | 'glass_blob' | 'hud_grid' | 'waveform_bars' | 'concentric_dials' | 'geometric_prism';
  scale?: number;
  thickness?: number;
  size?: number;
  rows?: number;
  cols?: number;
  speed?: number;
  glowIntensity?: number;
}

export interface Engine2DData {
  layoutStructure?: 'hud_circles' | 'floating_glass_shapes' | 'abstract_data_waves';
  colorPalette?: string[];
  colors?: string[];
  elements?: Visual2DElement[];
}

export interface Main2DProps {
  engine2D?: Engine2DData;
  sceneData?: {
    engine2D?: Engine2DData;
    colors?: string[];
  };
  data?: any;
  [key: string]: any;
}

// ------------------------------------------------------------------
// DYNAMIC VISUAL ELEMENT RENDERERS
// ------------------------------------------------------------------

const RenderDataRing: React.FC<{ el: Visual2DElement; idx: number; palette: string[]; frame: number; fps: number }> = ({ el, idx, palette, frame }) => {
  const scale = el.scale || 1.0;
  const thickness = el.thickness || 3;
  const col = palette[idx % palette.length] || '#00f0ff';
  const rotation = frame * (0.8 + idx * 0.4);

  return (
    <div
      style={{
        position: 'absolute',
        width: `${45 * scale}%`,
        height: `${45 * scale}%`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <circle
          cx="250"
          cy="250"
          r={200 * scale}
          fill="none"
          stroke={col}
          strokeWidth={thickness}
          strokeDasharray="30 15 10 15"
          strokeOpacity="0.85"
          transform={`rotate(${rotation} 250 250)`}
          style={{ filter: `drop-shadow(0 0 20px ${col})` }}
        />
        <circle
          cx="250"
          cy="250"
          r={160 * scale}
          fill="none"
          stroke={palette[(idx + 1) % palette.length] || '#ff007f'}
          strokeWidth={Math.max(1, thickness - 1)}
          strokeDasharray="60 20"
          strokeOpacity="0.6"
          transform={`rotate(-${rotation * 1.4} 250 250)`}
        />
      </svg>
    </div>
  );
};

const RenderGlassBlob: React.FC<{ el: Visual2DElement; idx: number; palette: string[]; frame: number }> = ({ el, idx, palette, frame }) => {
  const size = Math.min(el.size || 380, 600);
  const col1 = palette[idx % palette.length] || '#00f0ff';
  const col2 = palette[(idx + 1) % palette.length] || '#ff007f';
  const rotation = frame * 0.5 + idx * 45;
  const pulse = 1 + Math.sin(frame * 0.04 + idx) * 0.08;

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: idx % 2 === 0 ? '45% 55% 60% 40% / 50% 45% 55% 50%' : '55% 45% 40% 60% / 45% 55% 50% 50%',
        background: `linear-gradient(135deg, ${col1}20 0%, ${col2}10 100%)`,
        backdropFilter: 'blur(30px)',
        border: `2px solid rgba(255, 255, 255, 0.25)`,
        boxShadow: `0 20px 70px rgba(0,0,0,0.5), inset 0 0 30px ${col1}40`,
        transform: `rotate(${rotation}deg) scale(${pulse})`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '50%',
          height: '50%',
          borderRadius: '40%',
          border: `2px solid ${col2}`,
          boxShadow: `0 0 30px ${col2}60`,
          transform: `rotate(-${rotation * 2}deg)`,
        }}
      />
    </div>
  );
};

const RenderHudGrid: React.FC<{ el: Visual2DElement; idx: number; palette: string[]; frame: number }> = ({ el, idx, palette, frame }) => {
  const rows = el.rows || 4;
  const cols = el.cols || 6;
  const col = palette[idx % palette.length] || '#00f0ff';

  return (
    <div
      style={{
        position: 'absolute',
        width: '85%',
        height: '60%',
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
        padding: 20,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, cellIdx) => {
        const activePulse = Math.sin(frame * 0.1 + cellIdx * 0.4);
        const cellCol = activePulse > 0.5 ? col : 'rgba(255, 255, 255, 0.05)';

        return (
          <div
            key={cellIdx}
            style={{
              borderRadius: 8,
              border: `1px solid ${cellCol}`,
              backgroundColor: activePulse > 0.5 ? `${col}15` : 'transparent',
              boxShadow: activePulse > 0.5 ? `0 0 15px ${col}40` : 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
};

const RenderWaveformBars: React.FC<{ el: Visual2DElement; idx: number; palette: string[]; frame: number }> = ({ el, idx, palette, frame }) => {
  const scale = el.scale || 1.0;
  const barCount = 32;
  const col1 = palette[idx % palette.length] || '#00f0ff';
  const col2 = palette[(idx + 1) % palette.length] || '#ff007f';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '8%',
        left: '10%',
        right: '10%',
        height: `${22 * scale}%`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      {Array.from({ length: barCount }).map((_, bIdx) => {
        const height = interpolate(
          Math.sin(frame * 0.09 + bIdx * 0.3) * Math.cos(bIdx * 0.2 + frame * 0.05),
          [-1, 1],
          [15, 100]
        );
        const bCol = bIdx % 2 === 0 ? col1 : col2;

        return (
          <div
            key={bIdx}
            style={{
              flex: 1,
              height: `${height}%`,
              backgroundColor: bCol,
              borderRadius: 4,
              boxShadow: `0 0 14px ${bCol}80`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------
// MAIN 2D COMPOSITION
// ------------------------------------------------------------------
export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Robust prop extraction supporting both direct engine2D and nested sceneData
  const dynamicEngine2D: Engine2DData =
    props?.engine2D ||
    props?.sceneData?.engine2D ||
    props?.data?.engine2D ||
    {};

  const palette: string[] =
    dynamicEngine2D.colorPalette ||
    dynamicEngine2D.colors ||
    props?.sceneData?.colors ||
    props?.colors ||
    ['#00f0ff', '#ff007f', '#7000ff', '#00ffaa'];

  const c1 = palette[0] || '#00f0ff';
  const c2 = palette[1] || '#ff007f';
  const c3 = palette[2] || '#7000ff';

  const elements: Visual2DElement[] = Array.isArray(dynamicEngine2D.elements) && dynamicEngine2D.elements.length > 0
    ? dynamicEngine2D.elements
    : [
        { type: 'data_ring', scale: 1.0, thickness: 3 },
        { type: 'glass_blob', size: 380 },
        { type: 'hud_grid', rows: 4, cols: 6 },
        { type: 'waveform_bars', scale: 1.0 },
      ];

  const layout = dynamicEngine2D.layoutStructure || 'hud_circles';
  const scanlineY = ((frame * 6) % 1800) + 180;

  return (
    <AbsoluteFill
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5%',
        backgroundColor: '#04050d',
      }}
    >
      {/* 1. DYNAMIC COLOR GRADIENT BACKGROUND BLOBS */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: '90%',
          height: '90%',
          overflow: 'hidden',
          borderRadius: 40,
          border: `1px solid ${c1}20`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '45%',
            height: '45%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}30 0%, transparent 70%)`,
            top: '8%',
            left: '8%',
            filter: 'blur(90px)',
            transform: `scale(${1 + Math.sin(frame * 0.03) * 0.15})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '45%',
            height: '45%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c2}25 0%, transparent 70%)`,
            bottom: '8%',
            right: '8%',
            filter: 'blur(90px)',
            transform: `scale(${1 + Math.cos(frame * 0.03) * 0.15})`,
          }}
        />

        {/* Dynamic Scanning Laser Bar */}
        <div
          style={{
            position: 'absolute',
            left: '5%',
            width: '90%',
            top: `${scanlineY}px`,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, ${c3}, transparent)`,
            boxShadow: `0 0 25px ${c1}`,
            opacity: 0.75,
          }}
        />

        {/* Frame Corner Accents */}
        <div style={{ position: 'absolute', top: '4%', left: '4%', width: 24, height: 24, borderTop: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', top: '4%', right: '4%', width: 24, height: 24, borderTop: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', left: '4%', width: 24, height: 24, borderBottom: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', right: '4%', width: 24, height: 24, borderBottom: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
      </div>

      {/* 2. DYNAMICALLY MAPPED VISUAL ELEMENTS STACK */}
      <div
        style={{
          position: 'relative',
          width: '80%',
          height: '80%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {elements.map((el, idx) => {
          if (el.type === 'data_ring' || el.type === 'concentric_dials') {
            return <RenderDataRing key={idx} el={el} idx={idx} palette={palette} frame={frame} fps={fps} />;
          }
          if (el.type === 'glass_blob' || el.type === 'geometric_prism') {
            return <RenderGlassBlob key={idx} el={el} idx={idx} palette={palette} frame={frame} />;
          }
          if (el.type === 'hud_grid') {
            return <RenderHudGrid key={idx} el={el} idx={idx} palette={palette} frame={frame} />;
          }
          if (el.type === 'waveform_bars') {
            return <RenderWaveformBars key={idx} el={el} idx={idx} palette={palette} frame={frame} />;
          }
          return null;
        })}
      </div>
    </AbsoluteFill>
  );
};

export default Main2D;
