import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EliteVFX2D = ({ themeColor, aiSDFMath, customShader }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const sdfCode = aiSDFMath || customShader;
  const validSDF = (sdfCode && typeof sdfCode === 'string' && sdfCode.includes('map('))
    ? sdfCode
    : 'float map(vec3 p) { float sphere = length(p) - 1.0; vec3 d = abs(p) - vec3(0.8); float box = length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0); return mix(sphere, box, sin(time)*0.5+0.5); }';

  // The ultimate Raymarching Engine Shell
  const raymarchShell = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;

    // AI's INJECTED MATH GOES HERE:
    ${validSDF}

    // God-Tier Normal Calculation
    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0005;
      return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      
      // Camera Setup
      vec3 ro = vec3(0.0, 0.0, 3.0); // Ray Origin
      vec3 rd = normalize(vec3(uv, -1.5)); // Ray Direction
      
      // Raymarching Loop
      float t = 0.0;
      for(int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if(d < 0.001 || t > 10.0) break;
        t += d;
      }

      vec3 col = vec3(0.0); // Background
      
      // Lighting & Shading
      if(t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        
        float diff = max(dot(n, light), 0.0);
        float amb = 0.5 + 0.5 * dot(n, vec3(0.0, 1.0, 0.0));
        
        // Additive Cinematic Glow
        float glow = exp(-t * 0.2);
        
        col = colorTheme * (diff * 0.8 + amb * 0.2) + (colorTheme * glow);
      }

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#00ffcc");
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={raymarchShell}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
