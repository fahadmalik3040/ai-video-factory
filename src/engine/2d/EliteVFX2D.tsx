import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SHADER_HELPERS = `
  uniform float time;
  uniform vec3 colorTheme;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
      v += a * snoise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }
`;

export const EliteVFX2D = ({ themeColor, aiGLSLCode, customShader, aiSDFMath }: any) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  let rawCode = aiGLSLCode || customShader || aiSDFMath || "";
  if (typeof rawCode === 'string') {
    rawCode = rawCode
      .replace(/```glsl/gi, '')
      .replace(/```c/gi, '')
      .replace(/```/g, '')
      .replace(/uniform float time;/g, '')
      .replace(/uniform vec3 colorTheme;/g, '')
      .replace(/varying vec2 vUv;/g, '')
      .trim();
  }

  let finalFragmentShader = "";

  if (typeof rawCode === 'string' && rawCode.includes('void main')) {
    finalFragmentShader = `
      ${SHADER_HELPERS}
      \n${rawCode}
    `;
  } else if (typeof rawCode === 'string' && rawCode.includes('map(')) {
    finalFragmentShader = `
      ${SHADER_HELPERS}
      ${rawCode}
      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0005;
        return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
      }
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        vec3 ro = vec3(0.0, 0.0, 3.0);
        vec3 rd = normalize(vec3(uv, -1.5));
        float t = 0.0;
        for(int i = 0; i < 100; i++) {
          vec3 p = ro + rd * t;
          float d = map(p);
          if(d < 0.001 || t > 10.0) break;
          t += d;
        }
        vec3 col = vec3(0.0);
        if(t < 10.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(n, light), 0.0);
          float amb = 0.5 + 0.5 * dot(n, vec3(0.0, 1.0, 0.0));
          float glow = exp(-t * 0.2);
          col = colorTheme * (diff * 0.8 + amb * 0.2) + (colorTheme * glow);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `;
  } else {
    finalFragmentShader = `
      ${SHADER_HELPERS}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float n = fbm(p * 3.0 + vec2(time * 0.2, time * 0.1));
        float glow = 0.05 / (abs(sin(p.y * 5.0 + n * 3.0 + time)) + 0.02);
        gl_FragColor = vec4(colorTheme * glow, 1.0);
      }
    `;
  }

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
        fragmentShader={finalFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default EliteVFX2D;
