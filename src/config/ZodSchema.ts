import { z } from "zod";

export const videoSchema = z.object({
  prompt: z.string(),
  clipCategory: z.string().describe("The exact specific asset type, e.g., 'vhs_glitch', 'sci_fi_hud', 'light_leak', 'fluid_simulation', 'kinetic_text', 'raymarched_fractal', etc."),
  colorTheme: z.string(),
  complexity: z.string(),
  motionStyle: z.string(),
  customShader: z.string().describe("A fully functional highly advanced GLSL fragment shader mathematically generating this effect. Use uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; varying vec2 vUv;"),
  sceneText: z.string().describe("1-4 words for 3D Typography or HUD data. Leave empty if no text is needed. STRICTLY NO HTML.").optional(),
  bloomIntensity: z.number().describe("Float between 0.0 and 3.0 for cinematic glow."),
  aberration: z.number().describe("Float between 0.0 and 0.05 for RGB lens split."),
  seed: z.number(),
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
