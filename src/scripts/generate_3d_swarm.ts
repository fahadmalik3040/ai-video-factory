import fs from 'fs';
import { getJobTopic, sanitizeAndParseJson, queryLlm, getDynamicPalette } from './llmHelper';

export interface InfiniteGLSLPayload {
  commercialConcept: string;
  glslFragmentShader: string;
  uniforms: {
    u_colorPrimary: string;
    u_colorSecondary: string;
    u_speed: number;
  };
  engine2DOverlay: {
    overlayType: 'glitch_artifacts' | 'cinematic_light_leak' | 'cyberpunk_hud_svg';
    blendMode: 'screen' | 'color-dodge';
    opacity: number;
  };
  seoPackage: {
    title: string;
    description: string;
    seoTags: string[];
  };
  colors: string[];
}

export function generateProceduralGLSL(topic: string, seed: string): string {
  // Deterministic high-entropy hash for mathematical variance
  let hash = 0;
  const str = `${topic}_${seed}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const u1 = (Math.abs(hash % 100) / 10.0 + 1.0).toFixed(2);
  const u2 = (Math.abs((hash >> 4) % 100) / 15.0 + 1.0).toFixed(2);
  const u3 = (Math.abs((hash >> 8) % 100) / 8.0 + 1.0).toFixed(2);

  return `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_colorPrimary;
    uniform vec3 u_colorSecondary;
    uniform float u_speed;
    varying vec2 vUv;

    // Simplex Noise 3D Implementation
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
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float t = u_time * 0.35 * u_speed;

      vec3 p = vec3(uv * (${u1} + sin(t * 0.2) * 0.3), t * 0.4);
      float q = fbm(p + vec3(0.0, t * 0.2, 0.0));
      vec3 r = vec3(fbm(p + q * ${u2} + vec3(1.7, 9.2, 0.15 * t)), fbm(p + q * ${u3} + vec3(8.3, 2.8, 0.12 * t)), 0.0);
      float f = fbm(p + r * 2.5);

      vec3 col = mix(u_colorPrimary, u_colorSecondary, clamp(f * f * 3.5, 0.0, 1.0));
      col += vec3(0.8, 0.9, 1.0) * pow(clamp(f, 0.0, 1.0), 4.0);
      col *= (f * f * 1.5 + f * 0.8 + 0.2);

      // Vignette falloff
      col *= (1.0 - length(uv) * 0.45);
      gl_FragColor = vec4(col, 1.0);
    }
  `;
}

export async function run3DAISwarm(topic?: string, jobIdx?: number): Promise<InfiniteGLSLPayload> {
  const { topic: promptTopic, jobIndex } = topic && jobIdx !== undefined ? { topic, jobIndex: jobIdx } : getJobTopic();
  const seed = Math.random().toString(36).substring(7);
  console.log(`🌌 [Infinite GLSL Engine] Synthesizing Bespoke GPU Shader for: "${promptTopic}" (Job ${jobIndex}, Seed: ${seed})...`);

  const dynamicPalette = getDynamicPalette(promptTopic, seed);
  let payload: InfiniteGLSLPayload | null = null;

  const systemPrompt = `You are a World-Class Shadertoy GLSL Shader Engineer and Creative Director.
You write pure mathematical GLSL fragment shaders (raymarching, fractional brownian motion, domain warping, or cellular noise) that visualize any concept on a fullscreen GPU canvas.

STRICT MANDATES:
1. The 'glslFragmentShader' MUST be 100% valid GLSL code that compiles without errors.
2. It MUST use these exact uniforms:
   - uniform float u_time;
   - uniform vec2 u_resolution;
   - uniform vec3 u_colorPrimary;
   - uniform vec3 u_colorSecondary;
   - uniform float u_speed;
3. Output STRICT JSON conforming to the requested schema.`;

  const userPrompt = `Topic: "${promptTopic}".
Seed: "${seed}".
Primary Color: "${dynamicPalette[0]}".
Secondary Color: "${dynamicPalette[1]}".

Generate a completely custom, bespoke GLSL fragment shader and overlay configuration for "${promptTopic}".

JSON SCHEMA:
{
  "commercialConcept": "How this specific shader visualizes ${promptTopic} for commercial video editors",
  "glslFragmentShader": "string containing complete GLSL code...",
  "uniforms": {
    "u_colorPrimary": "${dynamicPalette[0]}",
    "u_colorSecondary": "${dynamicPalette[1]}",
    "u_speed": 1.4
  },
  "engine2DOverlay": {
    "overlayType": "glitch_artifacts" | "cinematic_light_leak" | "cyberpunk_hud_svg",
    "blendMode": "screen" | "color-dodge",
    "opacity": 0.85
  },
  "seoPackage": {
    "title": "4K Stock VFX: ${promptTopic} | Procedural GLSL Shader",
    "description": "Bespoke GPU shader mathematical simulation of ${promptTopic} for commercial video editors.",
    "seoTags": ["glsl", "shader", "4k stock", "procedural", "vfx", "${promptTopic.toLowerCase()}"]
  }
}`;

  try {
    const raw = await queryLlm({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const parsed = sanitizeAndParseJson(raw);
    if (parsed && parsed.glslFragmentShader && parsed.uniforms) {
      payload = parsed;
      console.log(`✅ [Infinite GLSL Engine] LLM Generated Bespoke Shader (${parsed.commercialConcept?.slice(0, 60)}...)`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Infinite GLSL Engine] Falling back to procedural mathematical GLSL synthesizer:`, err.message);
  }

  if (!payload) {
    const proceduralShader = generateProceduralGLSL(promptTopic, seed);
    const overlayTypes: InfiniteGLSLPayload['engine2DOverlay']['overlayType'][] = [
      'cinematic_light_leak',
      'glitch_artifacts',
      'cyberpunk_hud_svg'
    ];
    const chosenOverlay = overlayTypes[Math.abs(jobIndex) % overlayTypes.length];

    payload = {
      commercialConcept: `Procedural mathematical GPU fluid and raymarched field visualizing ${promptTopic}`,
      glslFragmentShader: proceduralShader,
      uniforms: {
        u_colorPrimary: dynamicPalette[0],
        u_colorSecondary: dynamicPalette[1],
        u_speed: 1.4
      },
      engine2DOverlay: {
        overlayType: chosenOverlay,
        blendMode: 'screen',
        opacity: 0.85
      },
      seoPackage: {
        title: `4K Stock VFX: ${promptTopic} | Procedural GLSL Shader`,
        description: `Bespoke GPU shader mathematical simulation of ${promptTopic} for commercial video editors.`,
        seoTags: ["glsl", "shader", "4k stock", "procedural", "vfx", promptTopic.toLowerCase()]
      },
      colors: [dynamicPalette[0], dynamicPalette[1]]
    };
  }

  payload.colors = [payload.uniforms.u_colorPrimary, payload.uniforms.u_colorSecondary];

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/metadata_3d.json`, JSON.stringify(payload, null, 2));
  fs.writeFileSync(`data/master_3d_payload.json`, JSON.stringify(payload, null, 2));

  return payload;
}

if (require.main === module) {
  run3DAISwarm();
}
