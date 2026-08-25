import React, { Suspense } from 'react';
import { AbsoluteFill } from 'remotion';
import { PremiumFinance3D } from '../engine/3d/PremiumFinance3D';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Canvas } from '@react-three/fiber';

export const MasterScene = ({ data }: any) => {
  const dynamicData = data?.job3D || data?.job2D || data;
  const colorTheme = dynamicData?.colorTheme || "#00ffcc";
  const trendTopic = dynamicData?.trendTopic || "GLOBAL MARKETS";
  
  return (
    <AbsoluteFill style={{ backgroundColor: "#02040a" }}>
      <AbsoluteFill>
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <PremiumFinance3D themeColor={colorTheme} />
            <EffectComposer disableNormalPass multisampling={8}>
              <Bloom intensity={2.0} luminanceSmoothing={0.9} luminanceThreshold={0.1} mipmapBlur />
              <Vignette darkness={1.2} offset={0.1} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </AbsoluteFill>

      <AbsoluteFill style={{ color: '#ffffff', padding: '80px', fontFamily: 'monospace', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${colorTheme}`, paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '60px', margin: 0, fontWeight: 'bold', letterSpacing: '5px' }}>{trendTopic ? trendTopic.toUpperCase() : "GLOBAL MARKETS"}</h1>
            <p style={{ fontSize: '30px', margin: 0, color: '#888' }}>LIVE EXCHANGE DATA // 4K RENDER</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '80px', margin: 0, color: colorTheme }}>+4,294.50</h2>
            <p style={{ fontSize: '40px', margin: 0, color: '#00ffcc' }}>▲ 12.4%</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '25px', color: '#666', lineHeight: '1.5' }}>
            INDEX: NASDAQ / S&P500<br/>
            STATUS: BULLISH TREND<br/>
            VOL: 8.4M SHARES
          </div>
          <div style={{ width: '300px', height: '100px', border: `1px solid ${colorTheme}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '30px', color: colorTheme }}>SYSTEM ACTIVE</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MasterScene;
