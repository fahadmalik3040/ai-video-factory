import { z } from 'zod';

export const SceneSchema = z.object({
  title: z.string().default("Abstract 3D Procedural Visual"),
  seoTags: z.array(z.string()).default([]),
  sceneType: z.enum(["nebula", "helix", "spheres", "lines", "quantum_grid", "data_stream", "cyber", "science", "finance"]).default("nebula"),
  particleShape: z.enum(["nebula", "helix", "spheres", "lines", "grid"]).default("nebula"),
  movementStyle: z.enum(["vortex", "wave", "orbital", "expansion", "quantum_flow"]).default("quantum_flow"),
  colors: z.array(z.string()).default(["#00f0ff", "#ff007f", "#7000ff"]),
  cameraSpeed: z.number().default(1.5),
  bloomIntensity: z.number().default(2.5),
  particleCount: z.number().default(2000),
  complexity: z.number().default(1.0)
});

export type SceneData = z.infer<typeof SceneSchema>;


