import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, AbsoluteFill } from 'remotion';

export interface Visual2DElement {
  type: string;
  scale?: number;
  thickness?: number;
  size?: number;
  rows?: number;
  cols?: number;
  speed?: number;
  glowIntensity?: number;
}

export interface Engine2DData {
  layoutStructure?: string;
  colorPalette?: string[];
  colors?: string[];
  energySpeed?: number;
  complexity?: number;
  glowIntensity?: number;
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
// ARCHETYPE 1: CYBER MATRIX TELEMETRY (High-Tech Radar & HUD)
// ------------------------------------------------------------------
const CyberMatrixTelemetry: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3, c4] = palette;
  const rot = frame * 0.9 * speed;
  const scanY = ((frame * 7 * speed) % 1700) + 200;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Scanning Laser Beam */}
      <div
        style={{
          position: 'absolute',
          left: '8%',
          width: '84%',
          top: `${scanY}px`,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, ${c4}, transparent)`,
          boxShadow: `0 0 30px ${c1}`,
          opacity: 0.85,
        }}
      />

      {/* Main SVG Radar & Telemetry Rings */}
      <svg viewBox="0 0 1000 1000" style={{ width: '75%', height: '75%', overflow: 'visible' }}>
        <circle cx="500" cy="500" r="450" fill="none" stroke={c1} strokeWidth="3" strokeDasharray="50 20 10 20" strokeOpacity="0.8" transform={`rotate(${rot} 500 500)`} />
        <circle cx="500" cy="500" r="390" fill="none" stroke={c2} strokeWidth="2.5" strokeDasharray="90 30 20 30" strokeOpacity="0.85" transform={`rotate(-${rot * 1.3} 500 500)`} />
        <circle cx="500" cy="500" r="320" fill="none" stroke={c3} strokeWidth="2" strokeDasharray="15 15" strokeOpacity="0.6" transform={`rotate(${rot * 0.6} 500 500)`} />
        <circle cx="500" cy="500" r="240" fill="none" stroke={c4} strokeWidth="4" strokeDasharray="180 60" strokeOpacity="0.9" transform={`rotate(-${rot * 2} 500 500)`} />
        <circle cx="500" cy="500" r="140" fill="none" stroke={c1} strokeWidth="2" strokeOpacity="0.5" />

        {/* Sweeping Radar Needle */}
        <line x1="500" y1="500" x2={500 + Math.cos(rot * 0.05) * 440} y2={500 + Math.sin(rot * 0.05) * 440} stroke={c1} strokeWidth="3" style={{ filter: `drop-shadow(0 0 15px ${c1})` }} />

        {/* Target Reticles */}
        <line x1="500" y1="50" x2="500" y2="120" stroke={c2} strokeWidth="4" />
        <line x1="500" y1="880" x2="500" y2="950" stroke={c2} strokeWidth="4" />
        <line x1="50" y1="500" x2="120" y2="500" stroke={c2} strokeWidth="4" />
        <line x1="880" y1="500" x2="950" y2="500" stroke={c2} strokeWidth="4" />
      </svg>

      {/* Dynamic Telemetry Matrix Meters */}
      <div style={{ position: 'absolute', bottom: '8%', left: '12%', right: '12%', display: 'flex', gap: 15 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', border: `1px solid ${c1}30` }}>
            <div style={{ width: `${(Math.sin(frame * 0.06 + i * 2) * 0.5 + 0.5) * 100}%`, height: '100%', background: palette[i % palette.length], boxShadow: `0 0 15px ${palette[i % palette.length]}` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ARCHETYPE 2: ORGANIC LIQUID PRISM (Glassmorphic Fluid Morphing)
// ------------------------------------------------------------------
const OrganicLiquidPrism: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3, c4] = palette;
  const rot = frame * 0.4 * speed;
  const pulse1 = 1 + Math.sin(frame * 0.03 * speed) * 0.12;
  const pulse2 = 1 + Math.cos(frame * 0.04 * speed) * 0.14;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Outer Polymorphic Glass Blob 1 */}
      <div
        style={{
          position: 'absolute',
          width: 580,
          height: 580,
          borderRadius: '40% 60% 65% 35% / 45% 40% 60% 55%',
          background: `linear-gradient(135deg, ${c1}25 0%, ${c2}15 100%)`,
          backdropFilter: 'blur(45px)',
          border: `2px solid rgba(255, 255, 255, 0.3)`,
          boxShadow: `0 30px 100px rgba(0,0,0,0.6), inset 0 0 50px ${c1}40`,
          transform: `rotate(${rot}deg) scale(${pulse1})`,
        }}
      />

      {/* Secondary Counter-Rotating Prism Blob 2 */}
      <div
        style={{
          position: 'absolute',
          width: 440,
          height: 440,
          borderRadius: '60% 40% 30% 70% / 55% 65% 35% 45%',
          background: `linear-gradient(225deg, ${c3}30 0%, ${c4}15 100%)`,
          backdropFilter: 'blur(35px)',
          border: `2px solid ${c3}80`,
          boxShadow: `0 0 60px ${c3}50`,
          transform: `rotate(-${rot * 1.6}deg) scale(${pulse2})`,
        }}
      />

      {/* Core Glowing Geometric Prism */}
      <div
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '35%',
          border: `3px solid ${c1}`,
          boxShadow: `0 0 50px ${c1}, inset 0 0 30px ${c2}`,
          transform: `rotate(${rot * 2.2}deg)`,
        }}
      />

      {/* Orbiting Satellite Particle Nodes */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx * (Math.PI / 3)) + (frame * 0.02 * speed);
        const radius = 380;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const col = palette[idx % palette.length];

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: col,
              boxShadow: `0 0 30px ${col}`,
              transform: `translate(${x}px, ${y}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------
// ARCHETYPE 3: PARAMETRIC AUDIO EQUALIZER (Circular & Linear Spectrum)
// ------------------------------------------------------------------
const ParametricAudioEqualizer: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3] = palette;
  const barCount = 48;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* 360-Degree Polar Circular Visualizer */}
      <div style={{ position: 'absolute', width: 600, height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * 360;
          const h = interpolate(
            Math.sin(frame * 0.08 * speed + i * 0.35) * Math.cos(i * 0.2),
            [-1, 1],
            [30, 160]
          );
          const col = i % 2 === 0 ? c1 : c2;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 6,
                height: h,
                backgroundColor: col,
                borderRadius: 4,
                boxShadow: `0 0 16px ${col}80`,
                transform: `rotate(${angle}deg) translate(0, -220px)`,
              }}
            />
          );
        })}
      </div>

      {/* Center Oscilloscope Core */}
      <div
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: `2px solid ${c3}`,
          boxShadow: `0 0 40px ${c3}60`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}40 0%, transparent 70%)`,
            transform: `scale(${1 + Math.sin(frame * 0.08 * speed) * 0.2})`,
          }}
        />
      </div>

      {/* Bottom Spectrum Analyzer Frequency Bars */}
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', right: '8%', height: '22%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        {Array.from({ length: barCount }).map((_, idx) => {
          const barH = interpolate(
            Math.sin(frame * 0.1 * speed + idx * 0.3) * Math.cos(idx * 0.18 + frame * 0.04),
            [-1, 1],
            [15, 100]
          );
          const col = idx % 2 === 0 ? c1 : c2;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${barH}%`,
                backgroundColor: col,
                borderRadius: 4,
                boxShadow: `0 0 16px ${col}90`,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ARCHETYPE 4: KINETIC BAUHAUS GRID (Isometric Neon Matrix)
// ------------------------------------------------------------------
const KineticBauhausGrid: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3, c4] = palette;
  const rows = 5;
  const cols = 7;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '85%',
          height: '75%',
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 20,
          transform: `perspective(1000px) rotateX(15deg) rotateZ(${Math.sin(frame * 0.01 * speed) * 4}deg)`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const wave = Math.sin(frame * 0.08 * speed + idx * 0.4);
          const isActive = wave > 0.3;
          const col = palette[idx % palette.length];
          const tileScale = isActive ? 1.08 : 0.95;

          return (
            <div
              key={idx}
              style={{
                borderRadius: 14,
                border: `2px solid ${isActive ? col : 'rgba(255,255,255,0.08)'}`,
                backgroundColor: isActive ? `${col}20` : 'rgba(255,255,255,0.02)',
                boxShadow: isActive ? `0 0 25px ${col}60` : 'none',
                transform: `scale(${tileScale})`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.1s ease',
              }}
            >
              {isActive && (
                <div
                  style={{
                    width: '40%',
                    height: '40%',
                    borderRadius: idx % 2 === 0 ? '50%' : 4,
                    backgroundColor: col,
                    boxShadow: `0 0 15px ${col}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ARCHETYPE 5: NEON DATA VORTEX (Logarithmic Hypnotic Tunnel)
// ------------------------------------------------------------------
const NeonDataVortex: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3] = palette;
  const ringCount = 14;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: ringCount }).map((_, i) => {
        const ringIdx = ringCount - i;
        const size = ringIdx * 80;
        const rot = frame * (0.5 + i * 0.1) * speed * (i % 2 === 0 ? 1 : -1);
        const col = palette[i % palette.length];
        const pulse = 1 + Math.sin(frame * 0.05 * speed + i * 0.3) * 0.08;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '35%' : '45%',
              border: `2px solid ${col}`,
              boxShadow: `0 0 25px ${col}50`,
              transform: `rotate(${rot}deg) scale(${pulse})`,
            }}
          />
        );
      })}

      {/* Center Quantum Singularity */}
      <div
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: c1,
          boxShadow: `0 0 60px ${c1}, 0 0 100px ${c2}`,
          transform: `scale(${1 + Math.sin(frame * 0.1 * speed) * 0.3})`,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------
// ARCHETYPE 6: HOLOGRAPHIC NEURAL SYNAPSE (Connected Laser Nodes)
// ------------------------------------------------------------------
const HolographicNeuralSynapse: React.FC<{ palette: string[]; frame: number; speed: number }> = ({ palette, frame, speed }) => {
  const [c1, c2, c3, c4] = palette;
  const nodes = [
    { x: 300, y: 300 },
    { x: 700, y: 300 },
    { x: 500, y: 500 },
    { x: 250, y: 700 },
    { x: 750, y: 700 },
    { x: 500, y: 200 },
    { x: 500, y: 800 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox="0 0 1000 1000" style={{ width: '80%', height: '80%', overflow: 'visible' }}>
        {/* Dynamic Connecting Laser Filaments */}
        {nodes.map((n1, i) =>
          nodes.slice(i + 1).map((n2, j) => {
            const pulse = (Math.sin(frame * 0.08 * speed + i + j) + 1) / 2;
            return (
              <line
                key={`${i}-${j}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={c1}
                strokeWidth={2 + pulse * 2}
                strokeOpacity={0.25 + pulse * 0.6}
                strokeDasharray="10 10"
                style={{ filter: `drop-shadow(0 0 10px ${c1})` }}
              />
            );
          })
        )}

        {/* Pulsing Synaptic Core Nodes */}
        {nodes.map((n, i) => {
          const col = palette[i % palette.length];
          const nodePulse = 1 + Math.sin(frame * 0.06 * speed + i) * 0.25;

          return (
            <g key={i} transform={`translate(${n.x}, ${n.y}) scale(${nodePulse})`}>
              <circle r="26" fill={col} fillOpacity="0.25" stroke={col} strokeWidth="3" style={{ filter: `drop-shadow(0 0 20px ${col})` }} />
              <circle r="12" fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------
// MAIN 2D ULTRA COMPOSITION (ARCHETYPE ROUTER)
// ------------------------------------------------------------------
export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const frame = useCurrentFrame();

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
  const speed = typeof dynamicEngine2D.energySpeed === 'number' ? dynamicEngine2D.energySpeed : 1.0;
  const layout = dynamicEngine2D.layoutStructure || 'cyber_matrix_telemetry';

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
        backgroundColor: '#03040a',
      }}
    >
      {/* 1. DYNAMIC COLOR AMBIENT BACKGROUND GLOWS */}
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

        {/* Frame Safe Corner Accents */}
        <div style={{ position: 'absolute', top: '4%', left: '4%', width: 26, height: 26, borderTop: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', top: '4%', right: '4%', width: 26, height: 26, borderTop: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', left: '4%', width: 26, height: 26, borderBottom: `2px solid ${c1}`, borderLeft: `2px solid ${c1}` }} />
        <div style={{ position: 'absolute', bottom: '4%', right: '4%', width: 26, height: 26, borderBottom: `2px solid ${c1}`, borderRight: `2px solid ${c1}` }} />
      </div>

      {/* 2. DYNAMIC ARCHETYPE RENDERING */}
      {layout === 'organic_liquid_prism' || layout === 'floating_glass_shapes' ? (
        <OrganicLiquidPrism palette={palette} frame={frame} speed={speed} />
      ) : layout === 'parametric_audio_equalizer' || layout === 'abstract_data_waves' ? (
        <ParametricAudioEqualizer palette={palette} frame={frame} speed={speed} />
      ) : layout === 'kinetic_bauhaus_grid' ? (
        <KineticBauhausGrid palette={palette} frame={frame} speed={speed} />
      ) : layout === 'neon_data_vortex' ? (
        <NeonDataVortex palette={palette} frame={frame} speed={speed} />
      ) : layout === 'holographic_neural_synapse' ? (
        <HolographicNeuralSynapse palette={palette} frame={frame} speed={speed} />
      ) : (
        <CyberMatrixTelemetry palette={palette} frame={frame} speed={speed} />
      )}
    </AbsoluteFill>
  );
};

export default Main2D;
