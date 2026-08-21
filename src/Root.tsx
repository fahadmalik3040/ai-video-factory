import React from "react";
import { Composition } from "remotion";
import { Main3D, type Main3DProps } from "./scenes/Main3D";
import { Main2D, type Main2DProps } from "./scenes/Main2D";

const defaultSceneProps: Main3DProps = {
  seoPackage: {
    title: "Futuristic Solid 3D Procedural Scene",
    description: "Cinematic 4K Motion Graphics Stock Visual",
    seoTags: ["futuristic", "3d", "procedural", "solid geometry", "motion graphics", "pbr", "4k"],
  },
  renderModes: ["3D"],
  engine3D: {
    solidGeometry: "BoxGeometry",
    layoutMath: "wave_plane",
    physicalMaterial: { metalness: 0.9, roughness: 0.1 },
    cameraMotion: "orbit_slow",
    cinematographyDP: {
      cameraPath: "slow_orbit",
      pacing: "extremely_slow_and_cinematic",
      focusDistance: 0,
    },
    colors: ["#00f0ff", "#ff007f", "#7000ff"],
    cameraSpeed: 1.0,
    bloomIntensity: 2.0,
    complexity: 1.0,
  },
  engine2D: {
    layoutStructure: "hud_circles",
    colorPalette: ["#00f0ff", "#ff007f", "#7000ff", "#00ffaa"],
    elements: [
      { type: "data_ring", scale: 1.0, thickness: 3 },
      { type: "glass_blob", size: 380 },
      { type: "hud_grid", rows: 5, cols: 8 },
      { type: "waveform_bars", scale: 1.0 },
    ],
  },
  colors: ["#00f0ff", "#ff007f", "#7000ff"],
  cameraSpeed: 1.0,
  bloomIntensity: 2.0,
  complexity: 1.0,
};

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Primary Mandatory 3D Procedural Stock Video Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main3D"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={defaultSceneProps}
      />

      {/* Secondary 2D Motion Graphics Composition (15 seconds @ 30fps) */}
      <Composition
        id="Main2D"
        component={Main2D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={defaultSceneProps as unknown as Main2DProps}
      />

      {/* MainVideo Alias for universal compatibility */}
      <Composition
        id="MainVideo"
        component={Main3D}
        durationInFrames={450}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={defaultSceneProps}
      />
    </>
  );
};

export default RemotionRoot;
export { RemotionRoot };
