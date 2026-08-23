import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const fallback3DProps: Main3DProps = {
  trendTopic: "AI Neural Network Quantum Core",
  clipCategory: "cinematic_particles",
  colorTheme: "#00f0ff",
  particleCount: 5000,
  cameraMotion: "orbit_slow",
};

const fallback2DProps: Main2DProps = {
  trendTopic: "Cyberpunk Holographic HUD Interface",
  clipCategory: "cyberpunk_hud",
  colorTheme: "#ff0055",
  customShader: `
    uniform float time; uniform vec3 colorTheme; uniform vec2 resolution; uniform float bloomIntensity; varying vec2 vUv;
    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
      float d = length(uv);
      float ring = abs(sin(d * 25.0 - time * 2.0)) < 0.05 ? 1.0 : 0.0;
      float core = 0.03 / (d + 0.05);
      vec3 col = colorTheme * (ring + core) * bloomIntensity;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  bloomIntensity: 1.5,
};

export const RemotionRoot: React.FC = () => {
  const dynamicProps: any = getInputProps();
  
  const props3D = dynamicProps?.job3D || dynamicProps?.data || (dynamicProps?.clipCategory?.includes("particle") ? dynamicProps : fallback3DProps);
  const props2D = dynamicProps?.job2D || dynamicProps?.data || fallback2DProps;

  return (
    <>
      {/* Primary 3D Procedural Particle & Geometry Composition (15s @ 30fps) */}
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
