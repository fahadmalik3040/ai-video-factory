import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const fallbackSceneProps: Main3DProps = {
  prompt: "Cinematic Universal 4K Stock Visual",
  clipCategory: "cosmic_energy",
  shaderType: "cosmic_energy",
  colorTheme: "#ff0055",
  complexity: "ultra_high",
  motionStyle: "cinematic_fluid",
  sceneText: "",
  bloomIntensity: 1.5,
  aberration: 0.005,
  speed: 1.0,
  seed: 42,
};

export const RemotionRoot: React.FC = () => {
  const dynamicProps = getInputProps();
  
  const safeProps =
    dynamicProps && typeof dynamicProps === "object" && Object.keys(dynamicProps).length > 0
      ? dynamicProps
      : fallbackSceneProps;

  return (
    <>
      {/* Primary 3D / GLSL Procedural Stock Video Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main3D"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={safeProps as Main3DProps}
      />

      {/* Secondary 2D Motion Graphics Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main2D"
        component={Main2D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={safeProps as Main2DProps}
      />

      {/* MainVideo Alias for universal compatibility */}
      <Composition
        id="MainVideo"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={safeProps as Main3DProps}
      />
    </>
  );
};

export default RemotionRoot;
