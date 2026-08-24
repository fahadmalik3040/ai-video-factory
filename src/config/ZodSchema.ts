import { z } from "zod";

export const videoSchema = z.object({
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum([
      "liquid_gradient_waves", 
      "cyberpunk_tech_hud", 
      "sci_fi_wireframe_grid", 
      "abstract_neon_topography"
    ]).describe("The Envato/Shutterstock stock footage category."),
    colorTheme: z.string(),
    aiGLSLCode: z.string().describe("Write the FULL 'void main()' GLSL fragment shader code for this category. DO NOT USE MARKDOWN. NO CODE BLOCKS. SINGLE LINE STRING.")
  }),
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.string(),
    colorTheme: z.string(),
    particleCount: z.number().default(15000)
  }).optional()
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
