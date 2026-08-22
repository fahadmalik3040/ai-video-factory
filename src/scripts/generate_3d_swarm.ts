import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export const GLSL_CATEGORIES = [
  "chemical_reaction",
  "liquid_fire",
  "quantum_waterfall",
  "plasma_storm"
] as const;

export type GLSLVfxCategory = typeof GLSL_CATEGORIES[number];

// Standard Shadertoy-grade Verified GLSL Shaders for Infinite Fluid / Raymarching
export const DEFAULT_GLSL_SHADERS: Record<GLSLVfxCategory, string> = {
  liquid_fire: `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_speed;
    uniform float u_density;
    varying vec2 vUv;

    // Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float f = 0.0;
      f += 0.5000 * snoise(p); p *= 2.02;
      f += 0.2500 * snoise(p); p *= 2.03;
      f += 0.1250 * snoise(p); p *= 2.01;
      f += 0.0625 * snoise(p);
      return f;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float t = u_time * 0.4 * u_speed;
      
      vec3 p = vec3(uv * u_density, t);
      p.y -= t * 0.8;
      
      float q = fbm(p + vec3(0.0));
      vec3 r = vec3(fbm(p + q + vec3(1.7, 9.2, 0.15 * t)), fbm(p + q + vec3(8.3, 2.8, 0.126 * t)), 0.0);
      float f = fbm(p + r * 2.0);
      
      vec3 col = mix(u_color1, u_color2, clamp((f*f)*4.0, 0.0, 1.0));
      col = mix(col, vec3(1.0, 0.9, 0.6), clamp(length(q), 0.0, 1.0));
      col = mix(col, vec3(0.02, 0.01, 0.05), clamp(length(r.x), 0.0, 1.0));
      
      col *= (f * f * f + (0.6 * f * f) + (0.5 * f));
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  chemical_reaction: `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_speed;
    uniform float u_density;
    varying vec2 vUv;

    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
      float t = u_time * 0.5 * u_speed;

      for(int i = 1; i < 7; i++) {
        float fi = float(i);
        p.x += 0.3 / fi * sin(fi * 3.0 * p.y + t + 0.3 * fi) + 0.5;
        p.y += 0.3 / fi * cos(fi * 3.0 * p.x + t + 0.3 * fi) - 0.5;
      }

      float v = sin(p.x * u_density) * cos(p.y * u_density) * 0.5 + 0.5;
      vec3 col = mix(u_color1, u_color2, v);
      col += vec3(0.3) * sin(v * 6.28318 + t * 2.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  quantum_waterfall: `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_speed;
    uniform float u_density;
    varying vec2 vUv;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float t = u_time * 0.6 * u_speed;
      
      float wave = sin(uv.x * 20.0 * u_density + t * 3.0) * 0.05;
      wave += cos(uv.y * 30.0 + t * 2.0) * 0.03;
      
      float stream = fract((uv.y + wave - t * 0.5) * 8.0 * u_density);
      float intensity = smoothstep(0.0, 0.4, stream) * (1.0 - smoothstep(0.4, 0.9, stream));
      
      vec3 col = mix(u_color1, u_color2, uv.y + sin(uv.x * 10.0 + t) * 0.2);
      col += vec3(intensity * 1.5);
      col += vec3(0.1, 0.3, 0.5) * (1.0 - uv.y);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  plasma_storm: `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform float u_speed;
    uniform float u_density;
    varying vec2 vUv;

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float t = u_time * 0.8 * u_speed;
      
      float d = length(uv) * u_density;
      float a = atan(uv.y, uv.x);
      
      float v = sin(d * 10.0 - t * 4.0 + sin(a * 5.0 + t * 2.0) * 3.0);
      v += cos(d * 8.0 + a * 3.0 - t * 3.0);
      v = v * 0.5 + 0.5;
      
      vec3 col = mix(u_color1, u_color2, v);
      col += vec3(1.0) * pow(v, 4.0);
      col *= (1.0 - length(uv) * 0.6);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `
};

export async function run3DAISwarm(topic?: string, jobIdx?: number): Promise<any> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🌀 [GLSL Shader Director] Generating Pure Procedural GLSL VFX for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  const chosenCat: GLSLVfxCategory = GLSL_CATEGORIES[Math.abs(jobIndex) % GLSL_CATEGORIES.length];

  let resultShader: any = null;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Suggested Category: "${chosenCat}".

You are an Elite GLSL Shader Engineer for Shadertoy and Adobe Stock VFX. Generate a pure procedural mathematical GLSL fragment shader configuration.

Output STRICT JSON:
{
  "vfxCategory": "chemical_reaction" | "liquid_fire" | "quantum_waterfall" | "plasma_storm",
  "uniforms": {
    "color1": "${dynamicPalette[0]}",
    "color2": "${dynamicPalette[1]}",
    "speed": 1.4,
    "density": 3.2
  },
  "seoPackage": {
    "title": "4K Procedural GLSL VFX: ${promptTopic} - ${chosenCat.replace(/_/g, ' ').toUpperCase()}",
    "description": "Pure mathematical raymarched and fluid GLSL simulation of ${promptTopic}.",
    "seoTags": ["glsl", "shader", "shadertoy", "4k vfx", "fluid simulation", "raymarching", "${chosenCat}", "${promptTopic.toLowerCase()}"]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        {
          role: "system",
          content: "You are an Elite GLSL Shader Engineer. Output STRICT JSON conforming to the GLSL schema."
        },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.vfxCategory) {
      resultShader = parsed;
      console.log(`✅ [GLSL Director] Selected Category: ${parsed.vfxCategory}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [GLSL Director] Using verified Shadertoy GLSL fallback:`, err.message);
  }

  if (!resultShader) {
    resultShader = {
      vfxCategory: chosenCat,
      uniforms: {
        color1: dynamicPalette[0],
        color2: dynamicPalette[1],
        speed: 1.4,
        density: 3.2
      },
      seoPackage: {
        title: `4K Procedural GLSL VFX: ${promptTopic} - ${chosenCat.replace(/_/g, ' ').toUpperCase()}`,
        description: `Pure mathematical raymarched and fluid GLSL simulation of ${promptTopic}.`,
        seoTags: ["glsl", "shader", "shadertoy", "4k vfx", "fluid simulation", "raymarching", chosenCat, promptTopic.toLowerCase()]
      }
    };
  }

  const category = (resultShader.vfxCategory as GLSLVfxCategory) || chosenCat;
  resultShader.glslFragmentShader = DEFAULT_GLSL_SHADERS[category] || DEFAULT_GLSL_SHADERS.liquid_fire;
  resultShader.colors = [resultShader.uniforms.color1, resultShader.uniforms.color2];

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultShader, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(resultShader, null, 2));
  fs.writeFileSync(`data/master_3d_payload.json`, JSON.stringify(resultShader, null, 2));

  return resultShader;
}

if (require.main === module) {
  run3DAISwarm();
}
