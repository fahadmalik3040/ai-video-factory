import React, {Suspense} from "react";
import {useCurrentFrame} from "remotion";
import type {SceneData} from "../config/ZodSchema";
import {DynamicModel} from "../assets/DynamicModel";

type ScienceSceneProps = {
  data: SceneData;
};

export const ScienceScene: React.FC<ScienceSceneProps> = ({data}) => {
  const frame = useCurrentFrame();
  const rotationSpeed = (data.camera?.speed ?? 1) * 0.02;
  const keyIntensity = data.lighting?.keyIntensity ?? 2;
  const ambientIntensity = data.lighting?.fillIntensity ?? 0.4;
  const meshColor = data.lighting?.colorTheme ?? "#22d3ee";

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={ambientIntensity} />
      <pointLight position={[4, 5, 4]} intensity={keyIntensity} color={meshColor} />
      <group position={[0, 0, 0]} rotation={[frame * rotationSpeed * 0.45, frame * rotationSpeed, 0]}>
        <Suspense fallback={null}>
          <DynamicModel url={data.modelQuery || ""} fallbackColor={meshColor} />
        </Suspense>
      </group>
    </>
  );
};

export default ScienceScene;
