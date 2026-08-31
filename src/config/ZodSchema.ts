import { z } from 'zod';

export const SceneSchema = z.object({
  title: z.string(),
  theme: z.enum(["cyberpunk", "holographic", "abstract_data", "quantum_core", "cinematic_finance"]),
  durationInFrames: z.number().min(900).max(1500),
  fps: z.number(),
  camera: z.object({
    path: z.enum(["orbit", "fly_through", "dolly_zoom", "chaotic_pan"]),
    startZ: z.number(),
    speed: z.number()
  }),
  environment: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    bgColor: z.string(),
    fogDensity: z.number()
  }),
  vfx: z.object({
    bloomIntensity: z.number(),
    glitchProbability: z.number(),
    particleCount: z.number().min(2000).max(10000),
    particleMotion: z.enum(["flow", "explode", "vortex", "matrix_rain"])
  }),
  mainGeometry: z.object({
    shape: z.enum(["data_monolith", "dna_helix", "fractal_cloud", "candlestick_city", "quantum_rings"]),
    wireframe: z.boolean(),
    rotationSpeed: z.number()
  }),
  seoTags: z.array(z.string()).max(50)
});
export type SceneData = z.infer<typeof SceneSchema>;
