import React from 'react';
import { useCurrentFrame } from 'remotion';

export const DynamicModel = ({ url, fallbackColor }: { url?: string, fallbackColor?: string }) => {
  const frame = useCurrentFrame();
  const color = fallbackColor || "#00ffff";

  return (
    <mesh rotation={[frame * 0.01, frame * 0.02, 0]}>
      <icosahedronGeometry args={[4, 1]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={true} 
        emissive={color} 
        emissiveIntensity={2} 
      />
    </mesh>
  );
};
