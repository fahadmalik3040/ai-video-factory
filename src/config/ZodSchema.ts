import { z } from "zod";

export const videoSchema = z.object({
  job2D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum(["liquid_gradient_waves", "cyberpunk_tech_hud", "abstract_neon_topography"]),
    colorTheme: z.string(),
    aiGLSLCode: z.string().describe("Write FULL 'void main()' 2D GLSL code. NO MARKDOWN.")
  }),
  job3D: z.object({
    trendTopic: z.string(),
    clipCategory: z.enum(["sci_fi_3d_tunnels", "liquid_metal_3d_fractals", "quantum_core_structures"]),
    colorTheme: z.string(),
    aiSDFMath: z.string().describe("Write ONLY the GLSL 'float map(vec3 p)' SDF function for 3D raymarching. NO MARKDOWN.")
  })
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
