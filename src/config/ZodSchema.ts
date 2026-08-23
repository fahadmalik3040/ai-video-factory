import { z } from "zod";

export const videoSchema = z.object({
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum(["cinematic_particles", "procedural_geometry", "raymarched_core", "abstract_wireframe"]),
    colorTheme: z.string(),
    particleCount: z.number(),
    cameraMotion: z.string(),
  }),
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum(["cyberpunk_hud", "cinematic_light_leak", "vhs_glitch", "fluid_overlay"]),
    colorTheme: z.string(),
    customShader: z.string().describe("Raw GLSL fragment shader for this exact 2D effect."),
    bloomIntensity: z.number(),
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
