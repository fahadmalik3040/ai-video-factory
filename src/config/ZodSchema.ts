import { z } from "zod";

export const videoSchema = z.object({
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum(["cinematic_galaxy", "quantum_core", "abstract_matrix"]),
    colorTheme: z.string(),
    particleCount: z.number().min(5000).max(20000)
  }),
  job2D: z.object({
    trendTopic: z.string(),
    shaderCategory: z.enum(["fluid_caustics", "cosmic_energy", "neon_lightning", "raymarched_core"]),
    colorTheme: z.string()
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
