import { z } from "zod";

export const videoSchema = z.object({
  prompt: z.string(),
  clipCategory: z.string(),
  shaderType: z.enum(["fluid_caustics", "cosmic_energy", "neon_lightning", "raymarched_core"]).describe("The specific premium shader engine to use."),
  colorTheme: z.string(),
  complexity: z.string(),
  motionStyle: z.string(),
  sceneText: z.string().describe("LEAVE EMPTY for 90% of videos. ONLY provide 1-3 words IF the category is strictly Kinetic Typography. We want clean VFX mostly.").optional(),
  bloomIntensity: z.number().describe("Float between 0.5 and 2.0"),
  aberration: z.number().describe("Float between 0.001 and 0.01"),
  speed: z.number().describe("Float between 0.2 and 2.0 to control animation speed"),
  seed: z.number(),
});

export type VideoData = z.infer<typeof videoSchema>;
export const SceneSchema = videoSchema;
export type SceneData = VideoData;
