import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const fallback3DProps: Main3DProps = {
  trendTopic: "Sci-Fi Infinite 3D Particle Swarm 4K",
  clipCategory: "sci_fi_3d_tunnels",
  colorTheme: "#ff0055",
  particleCount: 25000,
};

const fallback2DProps: Main2DProps = {
  trendTopic: "Liquid Gradient Waves 4K",
  clipCategory: "liquid_gradient_waves",
  colorTheme: "#00ffcc",
};

export const RemotionRoot: React.FC = () => {
  const dynamicProps: any = getInputProps();
  
  const props3D = dynamicProps?.job3D || dynamicProps?.data || (dynamicProps?.clipCategory?.includes("tunnel") || dynamicProps?.clipCategory?.includes("3d") ? dynamicProps : fallback3DProps);
  const props2D = dynamicProps?.job2D || dynamicProps?.data || fallback2DProps;

  return (
    <>
      {/* Primary 3D Procedural Raymarching SDF Composition (15s @ 30fps) */}
      <Composition
        id="Main3D"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={props3D}
      />

      {/* Secondary 2D Stock GLSL Composition (15s @ 30fps) */}
      <Composition
        id="Main2D"
        component={Main2D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={props2D}
      />

      {/* MainVideo Alias for 3D Composition */}
      <Composition
        id="MainVideo"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={props3D}
      />
    </>
  );
};

export default RemotionRoot;
