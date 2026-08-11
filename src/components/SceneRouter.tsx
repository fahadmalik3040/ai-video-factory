import React from "react";
import {ThreeCanvas} from "@remotion/three";
import type {SceneData} from "../config/ZodSchema";
import {ScienceScene} from "../scenes/ScienceScene";
import {AudioEngine} from "../engine/audio/AudioEngine";

type SceneRouterProps = {
  sceneData: SceneData;
};

export const SceneRouter: React.FC<SceneRouterProps> = ({sceneData}) => {
  const renderScene = () => {
    switch (sceneData.theme) {
      case "science":
        return <ScienceScene data={sceneData} />;
      default:
        return (
          <>
            <ambientLight intensity={0.5} />
            <mesh rotation={[0.3, 0.5, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          </>
        );
    }
  };

  return (
    <>
      <ThreeCanvas width={1920} height={1080}>{renderScene()}</ThreeCanvas>
      <AudioEngine audioData={sceneData.audio} />
    </>
  );
};
