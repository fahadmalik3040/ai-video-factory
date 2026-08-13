import { z } from 'zod';

export const SceneSchema = z.object({
  title: z.string(),
  theme: z.enum(["science", "cyber", "finance", "technology"]),
  durationInFrames: z.number(),
  fps: z.number(),
  camera: z.object({ type: z.string(), speed: z.number(), distance: z.number(), fov: z.number() }),
  lighting: z.object({ keyIntensity: z.number(), fillIntensity: z.number(), rimIntensity: z.number(), colorTheme: z.string() }),
  particles: z.object({ count: z.number(), speed: z.number(), color: z.string(), shape: z.string() }),
  seoTags: z.array(z.string()).max(50)
});
export type SceneData = z.infer<typeof SceneSchema>;
