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
  trendTopic: "Fluid Energy Caustics",
  clipCategory: "fluid_caustics",
  colorTheme: "#00f0ff",
  customShader: "uniform float time; uniform vec3 colorTheme; varying vec2 vUv; void main() { vec2 p = vUv * 3.0 - 1.5; for(int i=1; i<5; i++) { vec2 newp = p; newp.x += 0.6/float(i)*sin(float(i)*p.y+time/2.0+0.3); newp.y += 0.6/float(i)*cos(float(i)*p.x+time/2.0+0.3); p = newp; } gl_FragColor = vec4(colorTheme * (0.5 / length(sin(p))), 1.0); }",
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

      {/* Secondary 2D Pure GLSL Motion Graphics Composition (15s @ 30fps) */}
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
