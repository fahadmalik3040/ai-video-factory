import React from "react";
import {Composition} from "remotion";
import {SceneSchema, type SceneData} from "./config/ZodSchema";
import {SceneRouter} from "./components/SceneRouter";
import generatedSceneData from "../data/sceneData.json";

const fallbackSceneData: SceneData = {
  title: "Futuristic Solid 3D Procedural Scene",
  seoTags: ["futuristic", "3d", "procedural", "solid geometry", "motion graphics", "pbr", "4k"],
  solid_core: "abstract_solid_waves",
  sceneType: "abstract_solid_waves",
  movementStyle: "quantum_flow",
  colors: ["#00f0ff", "#ff007f", "#7000ff"],
  cameraSpeed: 1.5,
  bloomIntensity: 2.0,
  complexity: 1.0,
};

const parsedSceneData = SceneSchema.safeParse(generatedSceneData);
const sceneData = parsedSceneData.success ? parsedSceneData.data : fallbackSceneData;

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={SceneRouter}
      durationInFrames={300}
      fps={24}
      width={3840}
      height={2160}
      defaultProps={{sceneData}}
    />
  );
};

export default RemotionRoot;
export {RemotionRoot};
