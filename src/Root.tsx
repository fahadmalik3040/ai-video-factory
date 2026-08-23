import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const fallbackSceneProps: Main3DProps = {
  prompt: "Cinematic Universal 4K Stock Visual",
  clipCategory: "raymarched_fractal",
  colorTheme: "#00f0ff",
  complexity: "ultra_high",
  motionStyle: "cinematic_fluid",
  customShader: `
    uniform float time;
    uniform vec3 colorTheme;
    uniform vec2 resolution;
    uniform float bloomIntensity;
    uniform float aberration;
    varying vec2 vUv;
    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
      float d = length(p);
      float c = sin(d * 10.0 - time * 3.0);
      vec3 col = colorTheme * (0.5 + 0.5 * c) / (d + 0.2) * bloomIntensity;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  sceneText: "",
  bloomIntensity: 1.5,
  aberration: 0.005,
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
