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
      .trim();
  }

  const validSDF = (rawSDF && typeof rawSDF === 'string' && rawSDF.includes('map('))
    ? rawSDF
    : 'float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }';

  const raymarch3DShader = `
    uniform float time;
    uniform vec3 colorTheme;
    varying vec2 vUv;

    // AI's INJECTED 3D SDF MATH:
    ${validSDF}

    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0005;
      return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      vec3 ro = vec3(0.0, 0.0, 3.5);
      vec3 rd = normalize(vec3(uv, -1.5));
      
      float t = 0.0;
      for(int i = 0; i < 120; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if(d < 0.001 || t > 20.0) break;
        t += d * 0.8;
      }

      vec3 col = vec3(0.01, 0.01, 0.03);
      
      if(t < 20.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 light1 = normalize(vec3(1.0, 2.0, 1.5));
        vec3 light2 = normalize(vec3(-1.0, -1.0, -1.0));
        
        float diff1 = max(dot(n, light1), 0.0);
        float diff2 = max(dot(n, light2), 0.0) * 0.4;
        float amb = 0.3 + 0.3 * dot(n, vec3(0.0, 1.0, 0.0));
        
        vec3 viewDir = -rd;
        vec3 halfDir = normalize(light1 + viewDir);
        float spec = pow(max(dot(n, halfDir), 0.0), 32.0);
        
        float glow = exp(-t * 0.15);
        
        col = colorTheme * (diff1 * 0.7 + diff2 + amb * 0.3) + vec3(spec * 0.8) + (colorTheme * glow * 0.8);
      }

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
