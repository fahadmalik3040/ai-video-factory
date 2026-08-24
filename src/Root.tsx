import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const fallback3DProps: Main3DProps = {
  trendTopic: "Quantum Neural Galaxy",
  clipCategory: "cinematic_galaxy",
  colorTheme: "#ff0055",
  particleCount: 18000,
};

const fallback2DProps: Main2DProps = {
  trendTopic: "Liquid Gradient Waves 4K",
  clipCategory: "liquid_gradient_waves",
  colorTheme: "#00ffcc",
  aiGLSLCode: "void main() { vec2 p = vUv * 2.0 - 1.0; float n = fbm(p * 2.0 + vec2(time * 0.2, time * 0.15)); float wave = sin(p.x * 4.0 + n * 3.0 + time) * 0.5 + 0.5; gl_FragColor = vec4(mix(colorTheme, vec3(0.1, 0.0, 0.2), wave) + (0.05 / (abs(p.y - sin(p.x * 3.0 + time)*0.3) + 0.05)), 1.0); }",
};

export const RemotionRoot: React.FC = () => {
  const dynamicProps: any = getInputProps();
  
  const props3D = dynamicProps?.job3D || dynamicProps?.data || (dynamicProps?.clipCategory?.includes("galaxy") ? dynamicProps : fallback3DProps);
  const props2D = dynamicProps?.job2D || dynamicProps?.data || fallback2DProps;

  return (
    <>
      {/* Primary 3D Procedural Glowing Particle Composition (15s @ 30fps) */}
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
