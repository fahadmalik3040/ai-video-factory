import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const MasterScene2D = ({ data }: any) => {
  const frame = useCurrentFrame();
  const layout = data?.layout || { bgColor: "#0a0a12", textColor: "#ffffff", accentColor: "#ff0077" };
  const shapes = data?.shapes || { type: "circles", count: 8 };
  const title = data?.title || "DYNAMIC MOTION GRAPHICS";

  return (
    <AbsoluteFill style={{ backgroundColor: layout.bgColor, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {[...Array(shapes.count || 8)].map((_, i) => (
         <div 
           key={i} 
           style={{ 
             position: 'absolute', 
             width: 100 + i * 30, 
             height: 100 + i * 30, 
             border: `6px solid ${layout.accentColor}`, 
             borderRadius: shapes.type === 'circles' ? '50%' : '0', 
             transform: `rotate(${frame + i * 15}deg)`, 
             opacity: 0.15 
           }} 
         />
      ))}
      <h1 style={{ 
        color: layout.textColor, 
        fontSize: 130, 
        zIndex: 10, 
        textAlign: 'center', 
        fontFamily: 'system-ui, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '10px',
        maxWidth: '80%',
        textShadow: `0 0 30px ${layout.accentColor}, 0 0 60px ${layout.accentColor}` 
      }}>
        {title}
      </h1>
    </AbsoluteFill>
  );
};
