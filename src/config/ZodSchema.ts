import {z} from "zod";

export const CameraSchema = z.object({
  type: z.enum(["orbit", "pan", "push-in"]),
  speed: z.number().positive().max(10),
  distance: z.number().positive().max(1000),
  fov: z.number().min(10).max(120),
});

export const LightingSchema = z.object({
  keyIntensity: z.number().min(0).max(100),
  fillIntensity: z.number().min(0).max(100),
  rimIntensity: z.number().min(0).max(100),
  colorTheme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a six-digit hex color"),
});

export const ParticleSchema = z.object({
  count: z.number().int().min(0).max(100_000),
  speed: z.number().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a six-digit hex color"),
  shape: z.enum(["circle", "square", "star", "sphere", "spark"]),
});

export const AudioSchema = z.object({
  bgmStyle: z.string().min(1).max(120),
  sfxTypes: z.array(z.string().min(1).max(80)).max(20),
});

export const SceneSchema = z.object({
  title: z.string(),
  seoTags: z.array(z.string()).max(50),
  theme: z.enum(["science", "cyber", "finance"]),
  durationInFrames: z.number().int().positive().max(36_000),
  fps: z.number().int().min(1).max(120),
  camera: CameraSchema,
  lighting: LightingSchema,
  particles: ParticleSchema,
  audio: AudioSchema,
  seed: z.number().int().nonnegative(),
  modelQuery: z.string().min(1).max(500),
});

export type SceneData = z.infer<typeof SceneSchema>;
