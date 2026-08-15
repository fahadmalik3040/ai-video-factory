import {Composition} from "remotion";
import {SceneSchema, type SceneData} from "./config/ZodSchema";
import {SceneRouter} from "./components/SceneRouter";
import generatedSceneData from "../data/sceneData.json";

const fallbackSceneData: SceneData = {
  title: "Futuristic 3D Procedural Scene",
  theme: "science",
  durationInFrames: 1200,
  fps: 30,
  camera: {type: "orbit", speed: 1, distance: 6, fov: 45},
  lighting: {
    keyIntensity: 2,
    fillIntensity: 0.4,
    rimIntensity: 1,
    colorTheme: "#22d3ee",
  },
  particles: {count: 200, speed: 0.5, color: "#67e8f9", shape: "spark"},
  seoTags: ["futuristic", "3d", "procedural", "animation"],
};

const parsedSceneData = SceneSchema.safeParse(generatedSceneData);
const sceneData = parsedSceneData.success ? parsedSceneData.data : fallbackSceneData;

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={SceneRouter}
      durationInFrames={sceneData.durationInFrames || 300}
      fps={24}
      width={3840}
      height={2160}
      defaultProps={{sceneData}}
    />
  );
};

export default RemotionRoot;
export {RemotionRoot};
