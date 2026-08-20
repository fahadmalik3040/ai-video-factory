import { z } from 'zod';

export const SceneSchema = z.object({
  title: z.string().default("Solid 3D Procedural Visual"),
  seoTags: z.array(z.string()).default([]),
  solid_core: z.enum(["candlestick_boxes", "dna_molecules", "abstract_solid_waves"]).default("abstract_solid_waves"),
  solidCore: z.enum(["candlestick_boxes", "dna_molecules", "abstract_solid_waves"]).optional(),
  sceneType: z.string().default("abstract_solid_waves"),
  movementStyle: z.enum(["vortex", "wave", "orbital", "expansion", "quantum_flow"]).default("quantum_flow"),
  colors: z.array(z.string()).default(["#00f0ff", "#ff007f", "#7000ff"]),
  cameraSpeed: z.number().default(1.5),
  bloomIntensity: z.number().default(2.0),
  complexity: z.number().default(1.0)
});

export type SceneData = z.infer<typeof SceneSchema>;
