import { z } from "zod";

export const videoSchema = z.object({
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    particleCount: z.number().min(10000).max(25000)
  }),
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    aiSDFMath: z.string().describe("Write ONLY the GLSL float map(vec3 p) function. Use SDFs (length, mod, sin, max, min) to create the 3D shape. Return a float distance.")
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
