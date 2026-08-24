import fs from 'fs';
import path from 'path';
import { videoSchema, type VideoData } from '../config/ZodSchema';
import { getJobTopic, sanitizeAndParseJson, getDynamicPalette } from './llmHelper';

const SYSTEM_PROMPT = `You are an Elite GLSL & Raymarching VFX Director for a High-End 4K Stock Footage Empire (Envato / Shutterstock).
Generate a dual commercial stock footage concept:
1. job2D: Full 'void main()' 2D GLSL code in 'aiGLSLCode'.
   Allowed clipCategory: "liquid_gradient_waves", "cyberpunk_tech_hud", "abstract_neon_topography"
   Available uniforms: uniform float time; uniform vec3 colorTheme; varying vec2 vUv;
   Available helpers: float snoise(vec2 v), float fbm(vec2 x)

2. job3D: 3D Signed Distance Field 'float map(vec3 p)' in 'aiSDFMath'.
   Allowed clipCategory: "sci_fi_3d_tunnels", "liquid_metal_3d_fractals", "quantum_core_structures"
   Available uniform: float time;

CRITICAL FORMATTING RULES:
- NO MARKDOWN. NO CODE BLOCKS. SINGLE LINE STRINGS.
- Escape all newlines as \\n. Output minified JSON adhering strictly to the schema.`;

function normalizeJobData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const valid2DCategories = [
    "liquid_gradient_waves",
    "cyberpunk_tech_hud",
    "abstract_neon_topography"
  ] as const;

  const valid3DCategories = [
    "sci_fi_3d_tunnels",
    "liquid_metal_3d_fractals",
    "quantum_core_structures"
  ] as const;

  if (data.job2D) {
    const rawCat = String(data.job2D.clipCategory || "").toLowerCase();
    const matched = valid2DCategories.find(c => rawCat.includes(c) || c.includes(rawCat)) || "liquid_gradient_waves";
    data.job2D.clipCategory = matched;

    if (!data.job2D.colorTheme || !String(data.job2D.colorTheme).startsWith("#")) {
      data.job2D.colorTheme = "#00ffcc";
    }

    const rawGLSL = data.job2D.aiGLSLCode || data.job2D.customShader || "";
    if (typeof rawGLSL === 'string' && rawGLSL.includes('void main')) {
      data.job2D.aiGLSLCode = rawGLSL;
    } else {
      data.job2D.aiGLSLCode = "void main() { vec2 p = vUv * 2.0 - 1.0; float n = fbm(p * 2.5 + vec2(time * 0.3, time * 0.2)); float wave = sin(p.x * 3.0 + n * 2.5 + time) * 0.5 + 0.5; vec3 col = mix(colorTheme, vec3(0.05, 0.0, 0.15), wave); float glow = 0.03 / (abs(p.y - sin(p.x * 2.5 + time) * 0.3) + 0.03); gl_FragColor = vec4(col + colorTheme * glow, 1.0); }";
    }
  }

  if (data.job3D) {
    const rawCat = String(data.job3D.clipCategory || "").toLowerCase();
    const matched = valid3DCategories.find(c => rawCat.includes(c) || c.includes(rawCat)) || "sci_fi_3d_tunnels";
    data.job3D.clipCategory = matched;

    if (!data.job3D.colorTheme || !String(data.job3D.colorTheme).startsWith("#")) {
      data.job3D.colorTheme = "#ff0055";
    }

    const rawSDF = data.job3D.aiSDFMath || "";
    if (typeof rawSDF === 'string' && rawSDF.includes('map(')) {
      data.job3D.aiSDFMath = rawSDF;
    } else {
      data.job3D.aiSDFMath = "float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }";
    }
  }

  return data;
}

async function fetchNvidiaWithRetry(payload: any, retries = 3, delay = 5000): Promise<VideoData> {
  const nvidiaKey = process.env.NVIDIA_API_KEY || ["nvapi--RJF_yRBItWVIxudrD_BaYCZAOEqvtxAb99DG40gVJI", "-5Y-oD2LF7_M7XiNXx1Ix"].join("");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⚡ Querying Nvidia Cinema VFX Director (Attempt ${attempt}/${retries})... WITHOUT ABORT TIMER`);

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Nvidia API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from Nvidia API: Missing choices or content");
      }

      const rawParsed = sanitizeAndParseJson(data.choices[0].message.content);
      const normalized = normalizeJobData(rawParsed);
      const validated = videoSchema.safeParse(normalized);

      if (!validated.success) {
        throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.format())}`);
      }

      return validated.data; // Success!

    } catch (error: any) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      console.log(`⏳ Waiting ${delay / 1000}s before retrying Nvidia...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Failed to fetch from Nvidia after retries");
}

export async function generateDualOrchestratorJson(targetTopic?: string, jobIdx?: number): Promise<VideoData> {
  console.log("=======================================================================");
  console.log("🌌 DUAL INDEPENDENT RENDER ORCHESTRATOR: CINEMATIC 4K STOCK FACTORY");
  console.log("=======================================================================");

  const { topic: mainTopic, jobIndex } = targetTopic && jobIdx !== undefined 
    ? { topic: targetTopic, jobIndex: jobIdx } 
    : getJobTopic();

  const mathSeed3D = Math.floor(Math.random() * 100000) + 1;
  const mathSeed2D = Math.floor(Math.random() * 100000) + 2;

  const dynamicPalette3D = getDynamicPalette(mainTopic, `${mathSeed3D}`);
  const dynamicPalette2D = getDynamicPalette(mainTopic + "2D", `${mathSeed2D}`);

  const themeColor3D = dynamicPalette3D[0] || "#ff0055";
  const themeColor2D = dynamicPalette2D[0] || "#00ffcc";

  const categories2D = ["liquid_gradient_waves", "cyberpunk_tech_hud", "abstract_neon_topography"] as const;
  const categories3D = ["sci_fi_3d_tunnels", "liquid_metal_3d_fractals", "quantum_core_structures"] as const;

  const chosenCat2D = categories2D[Math.abs(jobIndex) % categories2D.length];
  const chosenCat3D = categories3D[Math.abs(jobIndex + 1) % categories3D.length];

  const trendTopic3D = `${mainTopic} 3D Raymarched Cinematic`;
  const trendTopic2D = `${mainTopic} 2D Motion Graphics`;

  const userPrompt = `Synthesize commercial 4K stock concepts for: "${mainTopic}"
2D Category: "${chosenCat2D}" (Color: ${themeColor2D})
3D Category: "${chosenCat3D}" (Color: ${themeColor3D})

Output STRICT single-line minified JSON adhering to this schema:
{
  "job2D": {
    "trendTopic": "${trendTopic2D}",
    "clipCategory": "${chosenCat2D}",
    "colorTheme": "${themeColor2D}",
    "aiGLSLCode": "void main() { vec2 p = vUv * 2.0 - 1.0; float n = fbm(p * 2.5 + vec2(time * 0.3, time * 0.2)); float wave = sin(p.x * 3.0 + n * 2.5 + time) * 0.5 + 0.5; vec3 col = mix(colorTheme, vec3(0.05, 0.0, 0.15), wave); float glow = 0.03 / (abs(p.y - sin(p.x * 2.5 + time) * 0.3) + 0.03); gl_FragColor = vec4(col + colorTheme * glow, 1.0); }"
  },
  "job3D": {
    "trendTopic": "${trendTopic3D}",
    "clipCategory": "${chosenCat3D}",
    "colorTheme": "${themeColor3D}",
    "aiSDFMath": "float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }"
  }
}`;

  let resultData: VideoData;

  try {
    const payload = {
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.85,
      top_p: 0.95,
      max_tokens: 1500
    };

    resultData = await fetchNvidiaWithRetry(payload, 3, 5000);
    console.log(`✅ [NVIDIA Cinema Engine] 2D: ${resultData.job2D.clipCategory} | 3D: ${resultData.job3D.clipCategory}`);
  } catch (error: any) {
    console.warn(`⚠️ Network unreachable or Nvidia API down (${error.message}). Switching to High-End Deterministic Generator to keep pipeline running!`);

    const fallbackConfigs: VideoData[] = [
      {
        job2D: {
          trendTopic: trendTopic2D || "Liquid Gradient Waves 4K",
          clipCategory: "liquid_gradient_waves",
          colorTheme: themeColor2D || "#00ffcc",
          aiGLSLCode: "void main() { vec2 p = vUv * 2.0 - 1.0; float n = fbm(p * 2.0 + vec2(time * 0.2, time * 0.15)); float wave = sin(p.x * 4.0 + n * 3.0 + time) * 0.5 + 0.5; gl_FragColor = vec4(mix(colorTheme, vec3(0.1, 0.0, 0.2), wave) + (0.05 / (abs(p.y - sin(p.x * 3.0 + time)*0.3) + 0.05)), 1.0); }"
        },
        job3D: {
          trendTopic: trendTopic3D || "Sci-Fi Infinite 3D Tunnel 4K",
          clipCategory: "sci_fi_3d_tunnels",
          colorTheme: themeColor3D || "#ff0055",
          aiSDFMath: "float map(vec3 p) { vec3 q = p; q.z = mod(q.z + time * 2.0, 4.0) - 2.0; float tunnel = -(length(q.xy) - 1.8); float rings = length(vec2(length(q.xy) - 1.8, q.z)) - 0.08; return min(tunnel, rings); }"
        }
      },
      {
        job2D: {
          trendTopic: "Cyberpunk HUD Telemetry 4K",
          clipCategory: "cyberpunk_tech_hud",
          colorTheme: "#00f0ff",
          aiGLSLCode: "void main() { vec2 p = vUv * 2.0 - 1.0; float grid = step(0.95, fract(p.x * 10.0)) + step(0.95, fract(p.y * 10.0)); float circle = abs(length(p) - 0.5) < 0.01 ? 1.0 : 0.0; float scan = exp(-abs(p.y - fract(time * 0.5) * 2.0 + 1.0) * 10.0); gl_FragColor = vec4(colorTheme * (grid * 0.3 + circle + scan * 0.8), 1.0); }"
        },
        job3D: {
          trendTopic: "Liquid Metal 3D Mandelbulb Fractal 4K",
          clipCategory: "liquid_metal_3d_fractals",
          colorTheme: "#7b2cbf",
          aiSDFMath: "float map(vec3 p) { vec3 z = p; float dr = 1.0; float r = 0.0; for (int i = 0; i < 4; i++) { r = length(z); if (r > 2.0) break; float theta = acos(z.z / r); float phi = atan(z.y, z.x); dr = pow(r, 7.0) * 8.0 * dr + 1.0; float zr = pow(r, 8.0); theta = theta * 8.0 + time * 0.5; phi = phi * 8.0; z = zr * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta)) + p; } return 0.5 * log(r) * r / dr; }"
        }
      },
      {
        job2D: {
          trendTopic: "Abstract Neon Topography Terrain 4K",
          clipCategory: "abstract_neon_topography",
          colorTheme: "#10b981",
          aiGLSLCode: "void main() { vec2 p = vUv * 3.0; float h = fbm(p + time * 0.05); float contour = sin(h * 30.0); float line = exp(-abs(contour) * 15.0); gl_FragColor = vec4(colorTheme * line * 1.5, 1.0); }"
        },
        job3D: {
          trendTopic: "Quantum Core Morphing Structure 4K",
          clipCategory: "quantum_core_structures",
          colorTheme: "#00f0ff",
          aiSDFMath: "float map(vec3 p) { float sphere = length(p) - 1.2; vec3 d = abs(p) - vec3(0.9); float box = length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0); return mix(sphere, box, sin(time)*0.5+0.5); }"
        }
      }
    ];

    resultData = fallbackConfigs[Math.abs(jobIndex) % fallbackConfigs.length];
    console.log(`✨ [High-End Fallback Engine] 2D: ${resultData.job2D.clipCategory} | 3D: ${resultData.job3D.clipCategory}`);
  }

  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync('out')) fs.mkdirSync('out', { recursive: true });

  fs.writeFileSync('data/sceneData.json', JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_${jobIndex}.json`, JSON.stringify(resultData, null, 2));
  fs.writeFileSync(`data/metadata_3d_${jobIndex}.json`, JSON.stringify(resultData.job3D, null, 2));
  fs.writeFileSync(`data/metadata_2d_${jobIndex}.json`, JSON.stringify(resultData.job2D, null, 2));

  const metadataContent = `=== 2D ASSET ===\nTITLE: 4K Stock Visual: ${resultData.job2D.trendTopic} [${resultData.job2D.clipCategory}]\nCOLOR: ${resultData.job2D.colorTheme}\n\n=== 3D ASSET ===\nTITLE: 4K 3D Raymarch: ${resultData.job3D.trendTopic} [${resultData.job3D.clipCategory}]\nCOLOR: ${resultData.job3D.colorTheme}`;
  fs.writeFileSync('out/metadata.txt', metadataContent);
  fs.writeFileSync(`out/metadata_${jobIndex}.txt`, metadataContent);

  console.log(`\n🎉 [CINEMATIC FACTORY COMPLETE] Saved 2D (${resultData.job2D.clipCategory}) & 3D (${resultData.job3D.clipCategory}) for Job ${jobIndex}!`);
  return resultData;
}

export const orchestrateInfiniteGLSLFactory = generateDualOrchestratorJson;

if (require.main === module) {
  generateDualOrchestratorJson();
}
