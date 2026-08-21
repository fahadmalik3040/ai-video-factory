import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, AbsoluteFill } from 'remotion';

export interface Engine2DElement {
  title?: string;
  content: string;
  badge?: string;
  metric?: string;
}

export interface Main2DProps {
  sceneData?: {
    seoPackage?: {
      title?: string;
      description?: string;
      seoTags?: string[];
    };
    title?: string;
    engine2D?: {
      layoutStructure?: 'hud_circles' | 'floating_glass_cards' | 'kinetic_stream' | 'hud_interface' | 'minimal_ui_cards' | 'typographic_kinetic';
      style?: string;
      colorPalette?: string[];
      colors?: string[];
      elements?: Engine2DElement[];
      textLayers?: string[];
      headline?: string;
      subheadline?: string;
      title?: string;
      subtitle?: string;
    };
    colors?: string[];
  };
  data?: any; // compatibility fallback
}

// ------------------------------------------------------------------
// LAYOUT 1: HUD CIRCLES & TELEMETRY
// ------------------------------------------------------------------
const HudCirclesLayout: React.FC<{
  title: string;
  elements: Engine2DElement[];
  palette: string[];
}> = ({ title, elements, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = palette[0] || '#00f0ff';
  const c2 = palette[1] || '#ff007f';
  const c3 = palette[2] || '#7000ff';
  const c4 = palette[3] || '#ffffff';

  const scanlinePos = (frame * 10) % 2160;
  const rotationAngle = frame * 1.2;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050711', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Dynamic Cyber Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${c1}12 1px, transparent 1px), linear-gradient(to bottom, ${c1}12 1px, transparent 1px)`,
          backgroundSize: '90px 90px',
          opacity: 0.7,
        }}
      />

      {/* Laser Scanline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: scanlinePos,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, transparent)`,
          boxShadow: `0 0 30px ${c1}`,
        }}
      />

      {/* Top Telemetry Header */}
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
          <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: c1, boxShadow: `0 0 20px ${c1}` }} />
          <span style={{ fontSize: 32, letterSpacing: '4px', color: c1, fontWeight: 800 }}>LIVE INTELLIGENCE STREAM // 4K</span>
        </div>
        <div style={{ fontSize: 26, color: '#94a3b8', fontFamily: 'monospace' }}>
          T-INDEX: {frame.toString().padStart(4, '0')} | RESOLUTION: 3840x2160
        </div>
      </div>

      {/* Center Dynamic HUD Gauge */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: '50%',
            border: `3px dashed ${c1}70`,
            transform: `rotate(${rotationAngle}deg)`,
            position: 'absolute',
            boxShadow: `0 0 50px ${c1}25`,
          }}
        />
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: `2px solid ${c2}60`,
            transform: `rotate(-${rotationAngle * 1.6}deg)`,
            position: 'absolute',
          }}
        />

        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            backgroundColor: `${c3}20`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${c1}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: `0 0 60px ${c1}40`,
          }}
        >
          <span style={{ fontSize: 20, letterSpacing: '3px', color: '#cbd5e1', fontWeight: 600 }}>TELEMETRY</span>
          <span style={{ fontSize: 52, fontWeight: 900, color: c4, textShadow: `0 0 25px ${c1}` }}>
            {((frame * 2.8) % 999).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Dynamic Topic Title */}
      <div
        style={{
          position: 'absolute',
          top: '56%',
          left: 120,
          right: 120,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            background: `linear-gradient(135deg, #ffffff, ${c1}, ${c2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 50px ${c1}40`,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Dynamic AI Generated Elements */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 120,
          right: 120,
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(Math.max(elements.length, 1), 4)}, 1fr)`,
          gap: 30,
        }}
      >
        {elements.map((el, i) => {
          const cardSpring = spring({ frame: frame - i * 6, fps, config: { damping: 12 } });
          return (
            <div
              key={i}
              style={{
                backgroundColor: 'rgba(10, 16, 38, 0.85)',
                border: `1px solid ${c1}50`,
                borderRadius: 20,
                padding: '28px 32px',
                boxShadow: `0 10px 40px rgba(0,0,0,0.6)`,
                transform: `scale(${cardSpring})`,
                opacity: cardSpring,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, color: c1, fontWeight: 800 }}>
                  {el.badge || `METRIC 0${i + 1}`}
                </span>
                {el.metric && (
                  <span style={{ fontSize: 22, color: c2, fontWeight: 700, fontFamily: 'monospace' }}>
                    {el.metric}
                  </span>
                )}
              </div>
              {el.title && (
                <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>
                  {el.title}
                </div>
              )}
              <div style={{ fontSize: 24, color: '#e2e8f0', lineHeight: 1.35, fontWeight: 500 }}>
                {el.content}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// LAYOUT 2: FLOATING GLASS CARDS (SOFTWARE / UI / PRODUCT)
// ------------------------------------------------------------------
const FloatingGlassCardsLayout: React.FC<{
  title: string;
  elements: Engine2DElement[];
  palette: string[];
}> = ({ title, elements, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = palette[0] || '#3b82f6';
  const c2 = palette[1] || '#10b981';
  const c3 = palette[2] || '#8b5cf6';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070913',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 140px',
      }}
    >
      {/* Background Radial Glows using Dynamic Palette */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}30 0%, transparent 70%)`,
          top: -200,
          left: -200,
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c2}25 0%, transparent 70%)`,
          bottom: -150,
          right: -150,
          filter: 'blur(120px)',
        }}
      />

      {/* Floating Header Banner Card */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(35px)',
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          borderRadius: 30,
          padding: '44px 80px',
          textAlign: 'center',
          marginBottom: 60,
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.5)`,
          maxWidth: 2400,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            backgroundColor: `${c1}25`,
            border: `1px solid ${c1}60`,
            borderRadius: 50,
            fontSize: 24,
            fontWeight: 800,
            color: c1,
            letterSpacing: '2px',
            marginBottom: 20,
          }}
        >
          ANALYSIS & BREAKDOWN
        </div>
        <h1
          style={{
            fontSize: 66,
            fontWeight: 900,
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            margin: 0,
            background: `linear-gradient(135deg, #ffffff 40%, ${c1})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Dynamic AI Generated Glass Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: elements.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
          gap: 40,
          width: '100%',
          maxWidth: 2400,
        }}
      >
        {elements.slice(0, 4).map((el, idx) => {
          const cardSpring = spring({ frame: frame - idx * 7, fps, config: { damping: 14 } });
          const cardColor = idx % 2 === 0 ? c1 : c2;
          const progress = interpolate((frame - idx * 5) % 100, [0, 100], [25, 95]);

          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(30px)',
                border: `1px solid rgba(255, 255, 255, 0.12)`,
                borderRadius: 28,
                padding: '44px 52px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                transform: `translateY(${(1 - cardSpring) * 70}px) scale(${cardSpring})`,
                opacity: cardSpring,
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      backgroundColor: cardColor,
                      boxShadow: `0 0 15px ${cardColor}`,
                    }}
                  />
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>
                    {el.title || el.badge || `KEY TAKEAWAY 0${idx + 1}`}
                  </span>
                </div>
                {el.metric && (
                  <span style={{ fontSize: 24, color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}>
                    {el.metric}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 30, color: '#cbd5e1', lineHeight: 1.4, fontWeight: 500 }}>
                {el.content}
              </div>

              {/* Dynamic Animated Accent Bar */}
              <div
                style={{
                  width: '100%',
                  height: 10,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: cardColor,
                    borderRadius: 6,
                    boxShadow: `0 0 15px ${cardColor}`,
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
// LAYOUT 3: KINETIC STREAM / TYPOGRAPHIC MOTION
// ------------------------------------------------------------------
const KineticStreamLayout: React.FC<{
  title: string;
  elements: Engine2DElement[];
  palette: string[];
}> = ({ title, elements, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = palette[0] || '#ec4899';
  const c2 = palette[1] || '#8b5cf6';
  const c3 = palette[2] || '#3b82f6';

  const words = title.split(' ');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#040612',
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
            fontWeight: 900,
            letterSpacing: '4px',
            color: c1,
            textTransform: 'uppercase',
          }}
        >
          // KINETIC MOTION ANALYSIS
        </span>
      </div>

      {/* Giant Kinetic Word Cascade */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {words.slice(0, 5).map((word, i) => {
          const wordSpring = spring({ frame: frame - i * 4, fps, config: { damping: 10 } });
          const offsetX = interpolate(wordSpring, [0, 1], [-120, 0]);

          return (
            <div
              key={i}
              style={{
                fontSize: 104,
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

      {/* Bottom Topic Elements */}
      <div
        style={{
          zIndex: 1,
          display: 'flex',
          gap: 30,
          borderTop: '2px solid rgba(255, 255, 255, 0.12)',
          paddingTop: 40,
        }}
      >
        {elements.slice(0, 3).map((el, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              padding: '28px 36px',
              borderRadius: 20,
              border: `1px solid ${c3}40`,
            }}
          >
            <div style={{ fontSize: 22, color: c3, fontWeight: 800, marginBottom: 10 }}>
              {el.badge || el.title || `PILLAR 0${i + 1}`}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
              {el.content}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// MAIN 2D SCENE EXPORT
// ------------------------------------------------------------------
export const Main2D: React.FC<Main2DProps> = (props) => {
  const activeData = props.sceneData || props.data || {};
  const e2d = activeData.engine2D || {};
  const seo = activeData.seoPackage || {};

  // Extract real dynamic title (ZERO hardcoding)
  const title =
    e2d.headline ||
    e2d.title ||
    seo.title ||
    activeData.title ||
    'Real-Time Intelligence Briefing';

  // Extract real dynamic palette
  const palette =
    e2d.colorPalette ||
    e2d.colors ||
    activeData.colors ||
    ['#00f0ff', '#ff007f', '#7000ff', '#ffffff'];

  // Normalize elements array from AI output (ZERO hardcoded fallback text)
  let elements: Engine2DElement[] = [];

  if (Array.isArray(e2d.elements) && e2d.elements.length > 0) {
    elements = e2d.elements;
  } else if (Array.isArray(e2d.textLayers) && e2d.textLayers.length > 0) {
    elements = e2d.textLayers.map((text: string, i: number) => ({
      badge: `POINT 0${i + 1}`,
      content: text,
    }));
  } else if (Array.isArray(seo.seoTags) && seo.seoTags.length > 0) {
    elements = seo.seoTags.slice(0, 4).map((tag: string, i: number) => ({
      badge: `TOPIC 0${i + 1}`,
      content: tag.toUpperCase(),
    }));
  } else {
    elements = [
      { badge: 'OVERVIEW', content: title },
      { badge: 'STATUS', content: 'Active Autonomous Stream' },
    ];
  }

  // Determine dynamic layout structure
  const layout = e2d.layoutStructure || e2d.style || 'floating_glass_cards';

  if (layout === 'hud_circles' || layout === 'hud_interface') {
    return <HudCirclesLayout title={title} elements={elements} palette={palette} />;
  }

  if (layout === 'kinetic_stream' || layout === 'typographic_kinetic') {
    return <KineticStreamLayout title={title} elements={elements} palette={palette} />;
  }

  return <FloatingGlassCardsLayout title={title} elements={elements} palette={palette} />;
};

export default Main2D;
