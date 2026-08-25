import { z } from "zod";

export const videoSchema = z.object({
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string()
  }),
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    particleCount: z.number().default(25000)
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
