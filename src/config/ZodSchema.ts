import { z } from 'zod';

export const SceneSchema2D = z.object({
  engine: z.literal("2D"),
  title: z.string(),
  theme: z.string(),
  durationInFrames: z.number().min(900).max(1500),
  fps: z.number(),
  layout: z.object({ bgColor: z.string(), textColor: z.string(), accentColor: z.string() }),
  shapes: z.object({ type: z.enum(["circles", "waves", "grids"]), count: z.number() }),
  seoTags: z.array(z.string()).max(50)
});

export const SceneSchema3D = z.object({
  engine: z.literal("3D"),
  title: z.string(),
  theme: z.string(),
  durationInFrames: z.number().min(900).max(1500),
  fps: z.number(),
  environment: z.object({ primaryColor: z.string(), secondaryColor: z.string() }),
  mainGeometry: z.object({ shape: z.enum(["quantum_rings", "data_monolith", "fractal_cloud"]), wireframe: z.boolean(), rotationSpeed: z.number() }),
  vfx: z.object({ particleCount: z.number() }),
  seoTags: z.array(z.string()).max(50)
});

export const FactorySchema = z.object({
  video2D: SceneSchema2D,
  video3D: SceneSchema3D
});

export type SceneData2D = z.infer<typeof SceneSchema2D>;
export type SceneData3D = z.infer<typeof SceneSchema3D>;
export type FactoryData = z.infer<typeof FactorySchema>;
