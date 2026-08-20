import { z } from 'zod';

export const SceneSchema = z.object({
  title: z.string().default("Abstract 3D Stock Scene"),
  seoTags: z.array(z.string()).default([]),
  sceneType: z.enum(["finance", "science", "cyber"]).default("cyber"),
  colors: z.array(z.string()).default(["#00f0ff", "#ff007f"]),
  cameraSpeed: z.number().default(1.5),
  bloomIntensity: z.number().default(2.0),
});

export type SceneData = z.infer<typeof SceneSchema>;

