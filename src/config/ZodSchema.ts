import { z } from "zod";

export const videoSchema = z.object({
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    aiSDFMath: z.string().describe("ONLY write the GLSL float map(vec3 p) function. NO MARKDOWN. NO CODE BLOCKS. SINGLE LINE STRING.")
  }),
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    particleCount: z.number().default(15000)
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
