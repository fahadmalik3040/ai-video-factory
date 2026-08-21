import React from "react";
import { Composition } from "remotion";
import { SceneSchema, type SceneData } from "./config/ZodSchema";
import { SceneRouter } from "./components/SceneRouter";
import { Scene2DRouter } from "./components/Scene2DRouter";
import generatedSceneData from "../data/sceneData.json";

const fallbackSceneData: SceneData = {
  seoPackage: {
    title: "Futuristic Solid 3D Procedural Scene",
    description: "Cinematic 4K Motion Graphics Stock Visual",
    seoTags: ["futuristic", "3d", "procedural", "solid geometry", "motion graphics", "pbr", "4k"],
  },
  renderModes: ["3D"],
  engine3D: {
    solidGeometry: "BoxGeometry",
    layoutMath: "wave_plane",
    physicalMaterial: { metalness: 0.9, roughness: 0.1 },
    cameraMotion: "orbit_slow",
    cinematographyDP: {
      cameraPath: "slow_orbit",
      pacing: "extremely_slow_and_cinematic",
      focusDistance: 0,
    },
    colors: ["#00f0ff", "#ff007f", "#7000ff"],
    cameraSpeed: 1.0,
    bloomIntensity: 2.0,
    complexity: 1.0,
  },
  engine2D: {
    style: "minimal_ui_cards",
    colors: ["#3b82f6", "#10b981", "#8b5cf6"],
    textLayers: ["Smart Automation", "Intelligent Processing", "Real-Time Sync"],
  },
  title: "Futuristic Solid 3D Procedural Scene",
  solid_core: "abstract_solid_waves",
  sceneType: "abstract_solid_waves",
  movementStyle: "quantum_flow",
  colors: ["#00f0ff", "#ff007f", "#7000ff"],
  cameraSpeed: 1.0,
  bloomIntensity: 2.0,
  complexity: 1.0,
};

const parsedSceneData = SceneSchema.safeParse(generatedSceneData);
const sceneData = parsedSceneData.success ? parsedSceneData.data : fallbackSceneData;

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Primary Mandatory 3D Procedural Stock Video Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main3D"
        component={SceneRouter}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{ sceneData }}
      />

      {/* Secondary 2D Motion Graphics Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main2D"
        component={Scene2DRouter}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{ sceneData }}
      />

      {/* MainVideo Alias for universal compatibility */}
      <Composition
        id="MainVideo"
        component={SceneRouter}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{ sceneData }}
      />
    </>
  );
};

export default RemotionRoot;
export { RemotionRoot };
