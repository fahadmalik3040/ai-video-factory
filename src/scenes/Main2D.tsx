import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { MasterScene } from './MasterScene';

export interface Main2DProps {
  commercialConcept?: string;
  glslFragmentShader?: string;
  uniforms?: {
    u_colorPrimary?: string;
    u_colorSecondary?: string;
    u_speed?: number;
  };
  engine2DOverlay?: {
    overlayType?: 'glitch_artifacts' | 'cinematic_light_leak' | 'cyberpunk_hud_svg';
    blendMode?: 'screen' | 'color-dodge';
    opacity?: number;
  };
  colors?: string[];
  [key: string]: any;
}

// ------------------------------------------------------------------
// 2D OVERLAY 1: GLITCH ARTIFACTS
// ------------------------------------------------------------------
const GlitchArtifactsOverlay: React.FC<{ colors: string[]; opacity: number; frame: number }> = ({ colors, opacity, frame }) => {
  const [c1, c2] = colors;
  const isGlitch = Math.sin(frame * 0.45) > 0.65;
  const sliceY = (frame * 16) % 1080;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      {isGlitch && (
        <>
          <div
            style={{
              position: 'absolute',
              top: `${sliceY}px`,
              left: 0,
              width: '100%',
              height: '35px',
              backgroundColor: `${c1}60`,
              clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${(sliceY + 160) % 1080}px`,
              left: 0,
              width: '100%',
              height: '20px',
              backgroundColor: `${c2}70`,
            }}
          />
        </>
      )}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 255, 255, 0.05) 3px, rgba(255, 255, 255, 0.05) 6px)`,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------
// 2D OVERLAY 2: CINEMATIC LIGHT LEAK
// ------------------------------------------------------------------
const CinematicLightLeakOverlay: React.FC<{ colors: string[]; opacity: number; frame: number }> = ({ colors, opacity, frame }) => {
  const [c1, c2] = colors;
  const t = frame * 0.025;
  const leak1X = interpolate(Math.sin(t * 0.8), [-1, 1], [-10, 50]);
  const leak1Y = interpolate(Math.cos(t * 0.6), [-1, 1], [-10, 40]);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      <div
        style={{
          position: 'absolute',
          left: `${leak1X}%`,
          top: `${leak1Y}%`,
          width: '75vw',
          height: '75vh',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}cc 0%, ${c2}40 50%, transparent 80%)`,
          filter: 'blur(120px)',
          transform: `scale(${1 + Math.sin(t) * 0.2})`,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------
// 2D OVERLAY 3: CYBERPUNK HUD SVG
// ------------------------------------------------------------------
const CyberpunkHudSvgOverlay: React.FC<{ colors: string[]; opacity: number; frame: number }> = ({ colors, opacity, frame }) => {
  const [c1, c2] = colors;
  const rot = frame * 0.6;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', opacity }}>
      <svg viewBox="0 0 1000 1000" style={{ width: '80%', height: '80%', overflow: 'visible' }}>
        <circle
          cx="500"
          cy="500"
          r="420"
          fill="none"
          stroke={c1}
          strokeWidth="2.5"
          strokeDasharray="40 20 10 20"
          transform={`rotate(${rot} 500 500)`}
          style={{ filter: `drop-shadow(0 0 12px ${c1})` }}
        />
        <circle
          cx="500"
          cy="500"
          r="340"
          fill="none"
          stroke={c2}
          strokeWidth="3"
          strokeDasharray="80 40 20 40"
          transform={`rotate(-${rot * 1.4} 500 500)`}
          style={{ filter: `drop-shadow(0 0 15px ${c2})` }}
        />
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------
// MASTER 2D COMPONENT: SHADER BACKDROP + PRO-OVERLAY
// ------------------------------------------------------------------
export const Main2D: React.FC<Main2DProps> = (props: any) => {
  const frame = useCurrentFrame();
  const dynamicData = props?.sceneData || props?.data || props;

  const overlayConfig = dynamicData?.engine2DOverlay || {};
  const overlayType = overlayConfig.overlayType || 'cinematic_light_leak';
  const blendMode = overlayConfig.blendMode || 'screen';
  const opacity = typeof overlayConfig.opacity === 'number' ? overlayConfig.opacity : 0.85;

  const colors = [
    dynamicData?.uniforms?.u_colorPrimary || dynamicData?.colors?.[0] || '#ff007f',
    dynamicData?.uniforms?.u_colorSecondary || dynamicData?.colors?.[1] || '#00f0ff',
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#020308', overflow: 'hidden' }}>
      {/* 1. Underlying Bespoke GPU Shader Canvas */}
      <ThreeCanvas
        width={3840}
        height={2160}
        style={{ width: 3840, height: 2160, position: 'absolute' }}
        camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 100 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
      >
        <MasterScene data={dynamicData} />
      </ThreeCanvas>

      {/* 2. Top-Layer Blend Mode Overlay */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', mixBlendMode: blendMode as any }}>
        {overlayType === 'glitch_artifacts' && <GlitchArtifactsOverlay colors={colors} opacity={opacity} frame={frame} />}
        {overlayType === 'cyberpunk_hud_svg' && <CyberpunkHudSvgOverlay colors={colors} opacity={opacity} frame={frame} />}
        {overlayType !== 'glitch_artifacts' && overlayType !== 'cyberpunk_hud_svg' && (
          <CinematicLightLeakOverlay colors={colors} opacity={opacity} frame={frame} />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default Main2D;
