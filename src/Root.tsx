import React from "react";
import { Composition, getInputProps } from "remotion";
import { SceneRouter } from "./components/SceneRouter";
import { MasterScene2D } from "./scenes/MasterScene2D";

export const RemotionRoot: React.FC = () => {
  const dynamicProps: any = getInputProps();

  return (
    <>
      {/* Dynamic Dual-Engine Scene Router */}
      <Composition
        id="SceneRouter"
        component={SceneRouter}
        durationInFrames={dynamicProps?.durationInFrames || 450}
        fps={dynamicProps?.fps || 30}
        width={3840}
        height={2160}
        defaultProps={dynamicProps}
      />

      {/* MasterScene Alias */}
      <Composition
        id="MasterScene"
        component={SceneRouter}
        durationInFrames={dynamicProps?.durationInFrames || 450}
        fps={dynamicProps?.fps || 30}
        width={3840}
        height={2160}
        defaultProps={dynamicProps}
      />

      {/* Dedicated 2D Motion Graphics Composition */}
      <Composition
        id="MasterScene2D"
        component={MasterScene2D}
        durationInFrames={dynamicProps?.durationInFrames || 450}
        fps={dynamicProps?.fps || 30}
        width={3840}
        height={2160}
        defaultProps={dynamicProps}
      />

      {/* Dedicated 3D Composition via SceneRouter */}
      <Composition
        id="MasterScene3D"
        component={SceneRouter}
        durationInFrames={dynamicProps?.durationInFrames || 450}
        fps={dynamicProps?.fps || 30}
        width={3840}
        height={2160}
        defaultProps={dynamicProps}
      />
    </>
  );
};

export default RemotionRoot;
