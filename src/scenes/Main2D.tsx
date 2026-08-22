import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';

export interface Main2DProps {
  engine2D?: {
    activeOverlay?: 'Glitch_Overlay' | 'Light_Leak' | 'Cyberpunk_HUD';
    blendMode?: 'screen' | 'overlay' | 'plus-lighter';
    intensity?: number;
    colors?: string[];
  };
  colors?: string[];
  [key: string]: any;
}

// ------------------------------------------------------------------
// PRO-VFX OVERLAY 1: GLITCH OVERLAY (Digital VHS Tear & RGB Split)
// ------------------------------------------------------------------
const GlitchOverlayModule: React.FC<{ colors: string[]; intensity: number; frame: number }> = ({
  colors,
  intensity,
  frame,
}) => {
  const [c1, c2] = colors;
  const isGlitchFrame = Math.sin(frame * 0.4) > 0.65;
  const jitterX = isGlitchFrame ? (Math.sin(frame * 12) * 18 * intensity) : 0;
  const sliceY = (frame * 14) % 1080;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen',
        overflow: 'hidden',
        transform: `translateX(${jitterX}px)`,
      }}
    >
      {/* RGB Split Chromatic Dispersion Bars */}
      {isGlitchFrame && (
        <>
          <div
            style={{
              position: 'absolute',
              top: `${sliceY}px`,
              left: 0,
              width: '100%',
              height: '45px',
              backgroundColor: `${c1}50`,
              filter: 'blur(2px)',
              clipPath: 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${(sliceY + 120) % 1080}px`,
              left: 0,
              width: '100%',
              height: '25px',
              backgroundColor: `${c2}60`,
              filter: 'blur(1px)',
            }}
          />
        </>
      )}

      {/* VHS Noise Scanlines */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 255, 255, 0.04) 3px, rgba(255, 255, 255, 0.04) 6px)`,
          opacity: 0.75 * intensity,
        }}
      />

      {/* Horizontal High-Speed Digital Distortion Blocks */}
      {Array.from({ length: 8 }).map((_, i) => {
        const active = Math.sin(frame * 0.3 + i * 3) > 0.7;
        if (!active) return null;
        const top = ((i * 137 + frame * 8) % 1000);
        const w = 150 + (i * 45);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${top}px`,
              left: `${(i * 220) % 1800}px`,
              width: `${w}px`,
              height: '4px',
              backgroundColor: i % 2 === 0 ? c1 : c2,
              boxShadow: `0 0 15px ${i % 2 === 0 ? c1 : c2}`,
            }}
          />
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------
// PRO-VFX OVERLAY 2: LIGHT LEAK (Soft Anamorphic Cinematic Glows)
// ------------------------------------------------------------------
const LightLeakModule: React.FC<{ colors: string[]; intensity: number; frame: number }> = ({
  colors,
  intensity,
  frame,
}) => {
  const [c1, c2] = colors;
  const t = frame * 0.025;

  const leak1X = interpolate(Math.sin(t * 0.8), [-1, 1], [-10, 50]);
  const leak1Y = interpolate(Math.cos(t * 0.6), [-1, 1], [-10, 40]);
  const leak2X = interpolate(Math.cos(t * 0.7), [-1, 1], [40, 95]);
  const leak2Y = interpolate(Math.sin(t * 0.9), [-1, 1], [30, 85]);

  const opacity1 = (Math.sin(t * 1.2) * 0.2 + 0.65) * intensity;
  const opacity2 = (Math.cos(t * 1.1) * 0.2 + 0.6) * intensity;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Primary Warm Flare Blob */}
      <div
        style={{
          position: 'absolute',
          left: `${leak1X}%`,
          top: `${leak1Y}%`,
          width: '75vw',
          height: '75vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}cc 0%, ${c1}40 45%, transparent 75%)`,
          filter: 'blur(120px)',
          opacity: opacity1,
          transform: `scale(${1 + Math.sin(t) * 0.2})`,
        }}
      />

      {/* Secondary Accent Optical Flare */}
      <div
        style={{
          position: 'absolute',
          left: `${leak2X}%`,
          top: `${leak2Y}%`,
          width: '65vw',
          height: '65vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c2}bb 0%, ${c2}30 50%, transparent 80%)`,
          filter: 'blur(110px)',
          opacity: opacity2,
          transform: `scale(${1 + Math.cos(t) * 0.2})`,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------
// PRO-VFX OVERLAY 3: CYBERPUNK HUD (Neon Telemetry & Reticles)
// ------------------------------------------------------------------
const CyberpunkHUDModule: React.FC<{ colors: string[]; intensity: number; frame: number }> = ({
  colors,
  intensity,
  frame,
}) => {
  const [c1, c2] = colors;
  const rot = frame * 0.6;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* HUD Telemetry Frame SVG */}
      <svg viewBox="0 0 1000 1000" style={{ width: '80%', height: '80%', overflow: 'visible' }}>
        {/* Outer Rotating Compass Dial */}
        <circle
          cx="500"
          cy="500"
          r="420"
          fill="none"
          stroke={c1}
          strokeWidth="2.5"
          strokeDasharray="40 20 10 20"
          strokeOpacity={0.85 * intensity}
          transform={`rotate(${rot} 500 500)`}
          style={{ filter: `drop-shadow(0 0 10px ${c1})` }}
        />

        {/* Counter-Rotating Internal Ring */}
        <circle
          cx="500"
          cy="500"
          r="340"
          fill="none"
          stroke={c2}
          strokeWidth="3"
          strokeDasharray="80 40 20 40"
          strokeOpacity={0.9 * intensity}
          transform={`rotate(-${rot * 1.4} 500 500)`}
          style={{ filter: `drop-shadow(0 0 12px ${c2})` }}
        />

        {/* Core Crosshair Targeting Reticle */}
        <line x1="500" y1="200" x2="500" y2="280" stroke={c1} strokeWidth="3" style={{ filter: `drop-shadow(0 0 8px ${c1})` }} />
        <line x1="500" y1="720" x2="500" y2="800" stroke={c1} strokeWidth="3" style={{ filter: `drop-shadow(0 0 8px ${c1})` }} />
        <line x1="200" y1="500" x2="280" y2="500" stroke={c1} strokeWidth="3" style={{ filter: `drop-shadow(0 0 8px ${c1})` }} />
        <line x1="720" y1="500" x2="800" y2="500" stroke={c1} strokeWidth="3" style={{ filter: `drop-shadow(0 0 8px ${c1})` }} />
      </svg>

      {/* Top & Bottom Dynamic Data Bars */}
      <div style={{ position: 'absolute', top: '6%', left: '10%', right: '10%', display: 'flex', gap: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', border: `1px solid ${c1}30` }}>
            <div
              style={{
                width: `${(Math.sin(frame * 0.08 + i * 2) * 0.5 + 0.5) * 100}%`,
                height: '100%',
                backgroundColor: i % 2 === 0 ? c1 : c2,
                boxShadow: `0 0 12px ${i % 2 === 0 ? c1 : c2}`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// MASTER 2D PRO-VFX OVERLAY ENGINE
// ------------------------------------------------------------------
export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const frame = useCurrentFrame();

  const e2d = props?.engine2D || props?.sceneData?.engine2D || {};
  let activeOverlay = e2d.activeOverlay;

  if (!activeOverlay) {
    const layout = e2d.layoutStructure || '';
    if (layout.includes('glitch') || layout.includes('pixel') || layout.includes('vortex')) {
      activeOverlay = 'Glitch_Overlay';
    } else if (layout.includes('liquid') || layout.includes('wave') || layout.includes('prism')) {
      activeOverlay = 'Light_Leak';
    } else {
      activeOverlay = 'Cyberpunk_HUD';
    }
  }

  const rawColors = e2d.colors || e2d.colorPalette || props?.colors || ['#ff007f', '#00f0ff'];
  const colors: string[] = [rawColors[0] || '#ff007f', rawColors[1] || '#00f0ff'];
  const intensity = typeof e2d.intensity === 'number' ? e2d.intensity : 0.85;

  return (
    <AbsoluteFill
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#020308',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 2D PRO-VFX OVERLAY ROUTER */}
      {activeOverlay === 'Glitch_Overlay' && (
        <GlitchOverlayModule colors={colors} intensity={intensity} frame={frame} />
      )}
      {activeOverlay === 'Light_Leak' && (
        <LightLeakModule colors={colors} intensity={intensity} frame={frame} />
      )}
      {activeOverlay === 'Cyberpunk_HUD' && (
        <CyberpunkHUDModule colors={colors} intensity={intensity} frame={frame} />
      )}
      {activeOverlay !== 'Glitch_Overlay' && activeOverlay !== 'Light_Leak' && activeOverlay !== 'Cyberpunk_HUD' && (
        <LightLeakModule colors={colors} intensity={intensity} frame={frame} />
      )}
    </AbsoluteFill>
  );
};

export default Main2D;
