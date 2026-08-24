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
    customShader: z.string().describe("A fully functional, highly advanced GLSL fragment shader mathematically generating this effect. Use uniform float time; uniform vec3 colorTheme; varying vec2 vUv;")
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
