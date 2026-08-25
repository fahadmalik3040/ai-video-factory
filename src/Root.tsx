import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

import { MasterScene } from "./scenes/MasterScene";

const fallback3DProps: Main3DProps = {
  trendTopic: "WALL STREET INDEX",
  clipCategory: "candlestick_growth",
  colorTheme: "#00ffcc",
};

const fallback2DProps: Main2DProps = {
  trendTopic: "CYBER ECONOMY",
  clipCategory: "holographic_data",
  colorTheme: "#ff0055",
};

export const RemotionRoot: React.FC = () => {
  const dynamicProps: any = getInputProps();
  
  const props3D = dynamicProps?.job3D || dynamicProps?.data || (dynamicProps?.clipCategory?.includes("candlestick") || dynamicProps?.clipCategory?.includes("3d") ? dynamicProps : fallback3DProps);
  const props2D = dynamicProps?.job2D || dynamicProps?.data || fallback2DProps;

  return (
    <>
      {/* Master 3D Financial Candlestick Scene */}
      <Composition
        id="MasterScene"
        component={MasterScene}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={dynamicProps}
      />

      {/* Primary 3D Composition (15s @ 30fps) */}
      <Composition
        id="Main3D"
        component={MasterScene}
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

      {/* MainVideo Alias */}
      <Composition
        id="MainVideo"
        component={MasterScene}
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
