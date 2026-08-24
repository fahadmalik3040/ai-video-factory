import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PremiumParticles3D = ({ themeColor, aiSDFMath }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  let rawSDF = aiSDFMath || "";
  if (typeof rawSDF === 'string') {
    rawSDF = rawSDF
      .replace(/```glsl/gi, '')
      .replace(/```c/gi, '')
      .replace(/```/g, '')
      .replace(/uniform float time;/g, '')
      .replace(/uniform vec3 colorTheme;/g, '')
      .replace(/varying vec2 vUv;/g, '')
      .trim();
  }

  const validSDF = (rawSDF && typeof rawSDF === 'string' && rawSDF.includes('map('))
    ? rawSDF
    : 'float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }';

  const raymarch3DShader = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;

    // ACES Filmic Tonemapping
    vec3 acesFilm(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
    }

    // AI's INJECTED 3D SDF MATH:
    ${validSDF}

    // Bulletproof Normal Calculation with zero NaN risk
    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.001;
      vec3 n = e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx);
      float len = length(n);
      return len > 0.00001 ? n / len : vec3(0.0, 0.0, 1.0);
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      vec3 ro = vec3(0.0, 0.0, 3.5);
      vec3 rd = normalize(vec3(uv, -1.5));
      
      float t = 0.0;
      float minD = 100.0;
      for(int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if(d < minD) minD = d;
        if(d < 0.001 || t > 18.0) break;
        t += max(d * 0.75, 0.008);
      }

      // Atmospheric Deep Base
      vec3 col = vec3(0.015, 0.015, 0.035) * (1.0 - length(uv) * 0.4);
      
      if(t < 18.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 light1 = normalize(vec3(1.0, 2.0, 1.5));
        vec3 light2 = normalize(vec3(-1.2, -1.0, -0.8));
        
        float diff1 = max(dot(n, light1), 0.0);
        float diff2 = max(dot(n, light2), 0.0) * 0.35;
        float amb = 0.25 + 0.25 * dot(n, vec3(0.0, 1.0, 0.0));
        
        // Specular highlight with Fresnel
        vec3 viewDir = -rd;
        vec3 halfDir = normalize(light1 + viewDir);
        float spec = pow(max(dot(n, halfDir), 0.0), 32.0);
        float fresnel = pow(clamp(1.0 - max(dot(n, viewDir), 0.0), 0.0, 1.0), 3.0);
        
        // Volumetric Glow & Shading
        float glow = exp(-t * 0.12);
        vec3 surface = colorTheme * (diff1 * 0.8 + diff2 + amb * 0.25) + vec3(spec * 0.7) + fresnel * colorTheme * 0.6;
        col = mix(surface, col, clamp(t / 18.0, 0.0, 1.0)) + (colorTheme * glow * 0.6);
      } else {
        // Subtle proximity glow even on miss
        col += colorTheme * exp(-minD * 4.0) * 0.2;
      }

      // Apply ACES Tonemapping for punchy, Hollywood grade render
      col = acesFilm(col);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = useMemo(() => {
    let safeColor = new THREE.Color("#ff0055");
    try {
      if (typeof themeColor === 'string' && themeColor.startsWith('#')) {
        safeColor = new THREE.Color(themeColor);
      }
    } catch(e){}
    return { time: { value: 0 }, colorTheme: { value: safeColor } };
  }, [themeColor]);

  useFrame((state) => {
    // 0.15x Time Multiplier for slow, cinematic movement
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={raymarch3DShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default PremiumParticles3D;
