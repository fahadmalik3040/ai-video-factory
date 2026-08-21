import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, AbsoluteFill } from 'remotion';

export interface Scene2DProps {
  data: {
    seoPackage?: {
      title?: string;
      description?: string;
      seoTags?: string[];
    };
    title?: string;
    engine2D?: {
      style?: 'hud_interface' | 'minimal_ui_cards' | 'typographic_kinetic';
      colors?: string[];
      textLayers?: string[];
      title?: string;
      subtitle?: string;
    };
    colors?: string[];
  };
}

// ------------------------------------------------------------------
// HUD / Cyber Interface 2D Component
// ------------------------------------------------------------------
const HudInterface: React.FC<{ colors: string[]; textLayers: string[]; title: string }> = ({
  colors,
  textLayers,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = colors[0] || '#00f0ff';
  const c2 = colors[1] || '#ff007f';
  const c3 = colors[2] || '#7000ff';

  const scanlinePos = (frame * 12) % 2160;
  const rotationAngle = frame * 1.5;
  const pulseOpacity = 0.4 + Math.sin(frame * 0.1) * 0.3;

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070f', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Background Cyber Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${c1}15 1px, transparent 1px), linear-gradient(to bottom, ${c1}15 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.6,
        }}
      />

      {/* Dynamic Laser Scanline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: scanlinePos,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, transparent)`,
          boxShadow: `0 0 25px ${c1}`,
        }}
      />

      {/* Top Header Telemetry Bar */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 120,
          right: 120,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${c1}40`,
          paddingBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: c1, boxShadow: `0 0 15px ${c1}` }} />
          <span style={{ fontSize: 32, letterSpacing: '4px', color: c1, fontWeight: 700 }}>SYSTEM.ACTIVE // TELEMETRY 4K</span>
        </div>
        <div style={{ fontSize: 28, color: '#a0aec0', fontFamily: 'monospace' }}>
          FRAME: {frame.toString().padStart(4, '0')} | FPS: 24 | STATUS: OPTIMAL
        </div>
      </div>

      {/* Center HUD Visual Dial */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Rotating Circular HUD Ring */}
        <div
          style={{
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: `3px dashed ${c1}80`,
            transform: `rotate(${rotationAngle}deg)`,
            position: 'absolute',
            boxShadow: `0 0 40px ${c1}30`,
          }}
        />
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: `2px solid ${c2}60`,
            transform: `rotate(-${rotationAngle * 1.5}deg)`,
            position: 'absolute',
          }}
        />

        {/* Central Glowing Target */}
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: `${c3}15`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${c1}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: `0 0 60px ${c1}40`,
          }}
        >
          <span style={{ fontSize: 24, letterSpacing: '3px', color: '#cbd5e0' }}>METRIC STREAM</span>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#fff', textShadow: `0 0 20px ${c1}` }}>
            {((frame * 3.7) % 999).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div
        style={{
          position: 'absolute',
          bottom: 300,
          left: 120,
          right: 120,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: '-1px',
            background: `linear-gradient(135deg, #ffffff, ${c1}, ${c2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 40px ${c1}50`,
            marginBottom: 20,
          }}
        >
          {title.toUpperCase()}
        </h1>
      </div>

      {/* Bottom Live Data Feeds */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 120,
          right: 120,
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(textLayers.length || 3, 4)}, 1fr)`,
          gap: 30,
        }}
      >
        {(textLayers.length > 0 ? textLayers : ['REAL-TIME SYNC', 'LOW LATENCY', 'NEURAL AGENT', 'SECURE LAYER']).map(
          (text, i) => {
            const cardSpring = spring({ frame: frame - i * 5, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#0a0f24',
                  border: `1px solid ${c1}40`,
                  borderRadius: 16,
                  padding: '24px 30px',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                  transform: `scale(${cardSpring})`,
                  opacity: cardSpring,
                }}
              >
                <div style={{ fontSize: 20, color: c1, marginBottom: 8, fontWeight: 700 }}>
                  NODE // 0{i + 1}
                </div>
                <div style={{ fontSize: 28, color: '#ffffff', fontWeight: 600 }}>{text}</div>
              </div>
            );
          }
        )}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// Minimal UI Cards / Software Motion Graphics
// ------------------------------------------------------------------
const MinimalUiCards: React.FC<{ colors: string[]; textLayers: string[]; title: string }> = ({
  colors,
  textLayers,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = colors[0] || '#3b82f6';
  const c2 = colors[1] || '#10b981';
  const c3 = colors[2] || '#8b5cf6';

  const defaultLayers = [
    'Smart Calendar Intelligence',
    'Automated Workflow Actions',
    'Real-Time Collaboration',
    'Enterprise Cloud Storage',
  ];
  const items = textLayers.length > 0 ? textLayers : defaultLayers;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0c16',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 160px',
      }}
    >
      {/* Background Soft Color Gradients */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}35 0%, transparent 70%)`,
          top: -150,
          left: -150,
          filter: 'blur(100px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c2}30 0%, transparent 70%)`,
          bottom: -100,
          right: -100,
          filter: 'blur(100px)',
        }}
      />

      {/* Floating Header Card */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 28,
          padding: '40px 80px',
          textAlign: 'center',
          marginBottom: 60,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          maxWidth: 1800,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            backgroundColor: `${c1}25`,
            border: `1px solid ${c1}60`,
            borderRadius: 50,
            fontSize: 24,
            fontWeight: 700,
            color: c1,
            letterSpacing: '2px',
            marginBottom: 20,
          }}
        >
          SOFTWARE & PRODUCT SHOWCASE
        </div>
        <h1
          style={{
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: '-1.5px',
            margin: 0,
            background: `linear-gradient(135deg, #ffffff 40%, ${c1})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Grid of UI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 40,
          width: '100%',
          maxWidth: 2400,
        }}
      >
        {items.slice(0, 4).map((item, idx) => {
          const cardSpring = spring({ frame: frame - idx * 6, fps, config: { damping: 14 } });
          const progress = interpolate((frame - idx * 5) % 100, [0, 100], [20, 95]);

          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 24,
                padding: '40px 48px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                transform: `translateY(${(1 - cardSpring) * 60}px) scale(${cardSpring})`,
                opacity: cardSpring,
                boxShadow: '0 15px 45px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: idx % 2 === 0 ? c1 : c2,
                    }}
                  />
                  <span style={{ fontSize: 34, fontWeight: 700, color: '#ffffff' }}>{item}</span>
                </div>
                <span style={{ fontSize: 24, color: '#94a3b8', fontFamily: 'monospace' }}>
                  STEP 0{idx + 1}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: 12,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: idx % 2 === 0 ? c1 : c2,
                    borderRadius: 8,
                    boxShadow: `0 0 15px ${idx % 2 === 0 ? c1 : c2}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// Kinetic Typography Motion Graphics
// ------------------------------------------------------------------
const TypographicKinetic: React.FC<{ colors: string[]; textLayers: string[]; title: string }> = ({
  colors,
  textLayers,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = colors[0] || '#ec4899';
  const c2 = colors[1] || '#8b5cf6';
  const c3 = colors[2] || '#3b82f6';

  const words = title.split(' ');
  const defaultHighlights = ['NEXT GENERATION', 'POWERFUL CAPABILITIES', 'UNMATCHED PERFORMANCE'];
  const highlights = textLayers.length > 0 ? textLayers : defaultHighlights;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#030712',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '120px 140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Background Animated Gradient Mesh */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 20% 30%, ${c1}30 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, ${c2}25 0%, transparent 60%)`,
        }}
      />

      {/* Top Banner Tag */}
      <div style={{ zIndex: 1 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '4px',
            color: c1,
            textTransform: 'uppercase',
          }}
        >
          // KINETIC MOTION DESIGN
        </span>
      </div>

      {/* Giant Kinetic Word Cascade */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {words.slice(0, 4).map((word, i) => {
          const wordSpring = spring({ frame: frame - i * 4, fps, config: { damping: 10 } });
          const offsetX = interpolate(wordSpring, [0, 1], [-100, 0]);

          return (
            <div
              key={i}
              style={{
                fontSize: 120,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-2px',
                transform: `translateX(${offsetX}px)`,
                opacity: wordSpring,
                background:
                  i % 2 === 0
                    ? `linear-gradient(90deg, #ffffff, #e2e8f0)`
                    : `linear-gradient(90deg, ${c1}, ${c2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {word.toUpperCase()}
            </div>
          );
        })}
      </div>

      {/* Bottom Kinetic Tickers */}
      <div
        style={{
          zIndex: 1,
          display: 'flex',
          gap: 30,
          borderTop: '2px solid rgba(255, 255, 255, 0.1)',
          paddingTop: 40,
        }}
      >
        {highlights.slice(0, 3).map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              padding: '24px 32px',
              borderRadius: 16,
              border: `1px solid ${c3}40`,
            }}
          >
            <div style={{ fontSize: 22, color: c3, fontWeight: 700, marginBottom: 8 }}>FEATURE 0{i + 1}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>{item}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// Main 2D Scene Router
// ------------------------------------------------------------------
export const Scene2D: React.FC<Scene2DProps> = ({ data }) => {
  const style = data?.engine2D?.style || 'minimal_ui_cards';
  const colors = data?.engine2D?.colors || data?.colors || ['#00f0ff', '#ff007f', '#7000ff'];
  const textLayers = data?.engine2D?.textLayers || [];
  const title = data?.engine2D?.title || data?.title || data?.seoPackage?.title || 'Next-Gen Software Platform';

  if (style === 'hud_interface') {
    return <HudInterface colors={colors} textLayers={textLayers} title={title} />;
  }

  if (style === 'typographic_kinetic') {
    return <TypographicKinetic colors={colors} textLayers={textLayers} title={title} />;
  }

  return <MinimalUiCards colors={colors} textLayers={textLayers} title={title} />;
};

export default Scene2D;
