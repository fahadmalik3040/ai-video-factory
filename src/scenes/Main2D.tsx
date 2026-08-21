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

export interface Main2DProps {
  sceneData?: {
    engine2D?: {
      layoutStructure?: 'hud_circles' | 'floating_glass_shapes' | 'abstract_data_waves';
      colorPalette?: string[];
      colors?: string[];
      elements?: Visual2DElement[];
    };
    colors?: string[];
  };
  data?: any;
}

export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const activeData = props?.sceneData || props?.data || props || {};
  const e2d = activeData.engine2D || {};
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const palette =
    e2d.colorPalette ||
    e2d.colors ||
    activeData.colors ||
    ['#00f0ff', '#ff007f', '#7000ff', '#00ffaa'];

  const c1 = palette[0] || '#00f0ff';
  const c2 = palette[1] || '#ff007f';
  const c3 = palette[2] || '#7000ff';
  const c4 = palette[3] || '#00ffaa';

  // Extract visual elements array
  const rawElements = Array.isArray(e2d.elements) && e2d.elements.length > 0
    ? e2d.elements
    : [
        { type: 'data_ring', scale: 1.0, thickness: 3 },
        { type: 'glass_blob', size: 380 },
        { type: 'hud_grid', rows: 5, cols: 8 },
        { type: 'waveform_bars', scale: 1.0 },
      ];

  const rotationAngle = frame * 0.8;
  const pulseGlow = 0.5 + Math.sin(frame * 0.05) * 0.3;
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
      {/* 1. SAFE-BOUND BACKGROUND GRAPHIC LAYER */}
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
        {/* Subtle Ambient Radial Glow Blobs */}
        <div
          style={{
            position: 'absolute',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}30 0%, transparent 70%)`,
            top: '10%',
            left: '10%',
            filter: 'blur(80px)',
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
            bottom: '10%',
            right: '10%',
            filter: 'blur(90px)',
            transform: `scale(${1 + Math.cos(frame * 0.03) * 0.15})`,
          }}
        />

        {/* Dynamic Laser Line within Safe Viewport */}
        <div
          style={{
            position: 'absolute',
            left: '5%',
            width: '90%',
            top: `${scanlineY}px`,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, ${c4}, transparent)`,
            boxShadow: `0 0 25px ${c1}`,
            opacity: 0.7,
          }}
        />

        {/* Cyber Coordinate Crosshairs */}
        <div style={{ position: 'absolute', top: '4%', left: '4%', width: 24, height: 24, borderTop: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', top: '4%', right: '4%', width: 24, height: 24, borderTop: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', left: '4%', width: 24, height: 24, borderBottom: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', right: '4%', width: 24, height: 24, borderBottom: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
      </div>

      {/* 2. PURE VISUAL ABSTRACT HUD & GLASS MORPHIC ENGINE */}
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
        {/* CENTER CONCENTRIC DATA RINGS (SVG) */}
        <svg
          viewBox="0 0 1000 1000"
          style={{
            position: 'absolute',
            width: '75%',
            height: '75%',
            overflow: 'visible',
            filter: `drop-shadow(0 0 30px ${c1}40)`,
          }}
        >
          {/* Outer Segmented Telemetry Ring */}
          <circle
            cx="500"
            cy="500"
            r="440"
            fill="none"
            stroke={c1}
            strokeWidth="3"
            strokeDasharray="40 18 10 18"
            strokeOpacity="0.75"
            transform={`rotate(${rotationAngle} 500 500)`}
          />

          {/* Secondary Counter-Rotating Ring */}
          <circle
            cx="500"
            cy="500"
            r="380"
            fill="none"
            stroke={c2}
            strokeWidth="2.5"
            strokeDasharray="80 25 15 25"
            strokeOpacity="0.8"
            transform={`rotate(-${rotationAngle * 1.3} 500 500)`}
          />

          {/* Inner Dashed Ring */}
          <circle
            cx="500"
            cy="500"
            r="320"
            fill="none"
            stroke={c4}
            strokeWidth="2"
            strokeDasharray="12 12"
            strokeOpacity="0.6"
            transform={`rotate(${rotationAngle * 0.7} 500 500)`}
          />

          {/* Core Target Crosshair Lines */}
          <line x1="500" y1="180" x2="500" y2="240" stroke={c1} strokeWidth="3" strokeOpacity="0.8" />
          <line x1="500" y1="760" x2="500" y2="820" stroke={c1} strokeWidth="3" strokeOpacity="0.8" />
          <line x1="180" y1="500" x2="240" y2="500" stroke={c1} strokeWidth="3" strokeOpacity="0.8" />
          <line x1="760" y1="500" x2="820" y2="500" stroke={c1} strokeWidth="3" strokeOpacity="0.8" />
        </svg>

        {/* CENTER GLASSMORPHISM ORGANIC PRISM BLOB */}
        <div
          style={{
            position: 'absolute',
            width: '42%',
            height: '42%',
            borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
            background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)`,
            backdropFilter: 'blur(35px)',
            border: `2px solid rgba(255, 255, 255, 0.25)`,
            boxShadow: `0 20px 80px rgba(0,0,0,0.6), inset 0 0 35px ${c1}30`,
            transform: `rotate(${rotationAngle * 0.5}deg) scale(${1 + Math.sin(frame * 0.04) * 0.06})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Internal Geometric Core Accent */}
          <div
            style={{
              width: '60%',
              height: '60%',
              borderRadius: '35%',
              border: `2px solid ${c2}`,
              transform: `rotate(-${rotationAngle}deg)`,
              boxShadow: `0 0 40px ${c2}60`,
            }}
          />
        </div>

        {/* 3. DYNAMIC WAVEFORM EQUALIZER BARS (CLAMPED SAFE REGION) */}
        <div
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '10%',
            right: '10%',
            height: '18%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 14,
            padding: '0 20px',
          }}
        >
          {Array.from({ length: 28 }).map((_, idx) => {
            const barH = interpolate(
              Math.sin(frame * 0.08 + idx * 0.35) * Math.cos(idx * 0.2),
              [-1, 1],
              [20, 100]
            );
            const isAlt = idx % 2 === 0;
            const barColor = isAlt ? c1 : c2;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${barH}%`,
                  backgroundColor: barColor,
                  borderRadius: 4,
                  opacity: 0.85,
                  boxShadow: `0 0 15px ${barColor}70`,
                  transition: 'height 0.1s ease',
                }}
              />
            );
          })}
        </div>

        {/* 4. TOP DYNAMIC TELEMETRY PROGRESS METERS */}
        <div
          style={{
            position: 'absolute',
            top: '4%',
            left: '10%',
            right: '10%',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 30,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => {
            const meterProgress = interpolate(
              (frame + i * 25) % 120,
              [0, 120],
              [15, 95]
            );
            const meterCol = i === 0 ? c1 : i === 1 ? c2 : c4;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: `1px solid rgba(255, 255, 255, 0.12)`,
                }}
              >
                <div
                  style={{
                    width: `${meterProgress}%`,
                    height: '100%',
                    backgroundColor: meterCol,
                    borderRadius: 6,
                    boxShadow: `0 0 16px ${meterCol}`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Main2D;
