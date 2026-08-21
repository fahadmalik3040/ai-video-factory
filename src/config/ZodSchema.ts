import { z } from 'zod';

export const CinematographyDPSchema = z.object({
  cameraPath: z.enum(["slow_orbit", "smooth_dolly_in", "macro_pan_up"]).default("slow_orbit"),
  pacing: z.string().default("extremely_slow_and_cinematic"),
  focusDistance: z.number().default(0)
}).default({
  cameraPath: "slow_orbit",
  pacing: "extremely_slow_and_cinematic",
  focusDistance: 0
});

export const Engine3DSchema = z.object({
  solidGeometry: z.enum(["BoxGeometry", "SphereGeometry", "CylinderGeometry", "TorusGeometry"]).default("BoxGeometry"),
  layoutMath: z.enum(["grid", "concentric_rings", "dna_helix", "wave_plane"]).default("wave_plane"),
  physicalMaterial: z.object({
    metalness: z.number().default(0.9),
    roughness: z.number().default(0.1)
  }).default({ metalness: 0.9, roughness: 0.1 }),
  cameraMotion: z.enum(["orbit_slow", "macro_dolly_in"]).default("orbit_slow"),
  cinematographyDP: CinematographyDPSchema,
  colors: z.array(z.string()).default(["#00f0ff", "#ff007f", "#7000ff"]),
  cameraSpeed: z.number().default(1.0),
  bloomIntensity: z.number().default(2.0),
  complexity: z.number().default(1.2)
});

export const Engine2DSchema = z.object({
  style: z.enum(["hud_interface", "minimal_ui_cards", "typographic_kinetic"]).default("minimal_ui_cards"),
  colors: z.array(z.string()).default(["#3b82f6", "#10b981", "#8b5cf6"]),
  textLayers: z.array(z.string()).default([]),
  title: z.string().optional(),
  subtitle: z.string().optional()
}).optional();

export const SEOPackageSchema = z.object({
  title: z.string().default("Solid 3D Procedural Visual"),
  description: z.string().default("Cinematic 4K Motion Graphics Video"),
  seoTags: z.array(z.string()).default([])
});

export const SceneSchema = z.object({
  seoPackage: SEOPackageSchema.default({
    title: "Solid 3D Procedural Visual",
    description: "Cinematic 4K Motion Graphics Video",
    seoTags: []
  }),
  renderModes: z.array(z.enum(["3D", "2D"])).default(["3D"]),
  engine3D: Engine3DSchema.default({}),
  engine2D: Engine2DSchema,
  // Backward compatibility top-level keys
  title: z.string().optional(),
  seoTags: z.array(z.string()).optional(),
  solid_core: z.string().optional(),
  solidCore: z.string().optional(),
  sceneType: z.string().optional(),
  movementStyle: z.string().optional(),
  colors: z.array(z.string()).optional(),
  cameraSpeed: z.number().optional(),
  bloomIntensity: z.number().optional(),
  complexity: z.number().optional()
});

export type SceneData = z.infer<typeof SceneSchema>;
