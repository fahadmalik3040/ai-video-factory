import React from "react";
import {useGLTF} from "@react-three/drei";

type DynamicModelProps = {
  url: string;
  fallbackColor: string;
};

const isModelUrl = (url: string): boolean => {
  const normalizedUrl = url.trim();
  return /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(normalizedUrl) || /\.(glb|gltf)(\?.*)?$/i.test(normalizedUrl);
};

const FallbackModel: React.FC<{color: string}> = ({color}) => (
  <mesh>
    <torusKnotGeometry args={[1.2, 0.32, 160, 24]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.45} roughness={0.22} />
  </mesh>
);

const LoadedModel: React.FC<{url: string}> = ({url}) => {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} />;
};

export const DynamicModel: React.FC<DynamicModelProps> = ({url, fallbackColor}) => {
  if (!url.trim() || !isModelUrl(url)) {
    return <FallbackModel color={fallbackColor || "#22d3ee"} />;
  }

  return (
    <group position={[0, 0, 0]}>
      <LoadedModel url={url} />
    </group>
  );
};
