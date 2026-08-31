import { useFrame } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { random } from 'remotion';

// Accept the dynamic props injected by the render script
const SceneLogic = ({ seed, themeColor }: { seed: string; themeColor: string }) => {
  // Use Remotion's random() with the unique seed. 
  // It gives a unique value per render, but stays consistent across all 60fps frames so it doesn't flicker!
  const startRotation = random(seed) * Math.PI * 2;
  const rotationSpeed = 0.01 + random(seed + "speed") * 0.05;

  useFrame((state, delta) => {
    // Your animation logic here...
  });

  return (
    <mesh rotation-y={startRotation}>
      <boxGeometry />
      <meshStandardMaterial color={themeColor} />
    </mesh>
  );
};

// Make sure your Master component accepts the inputProps
export const MasterScene = ({ seed = "default-seed", themeColor = "hotpink" }: { seed?: string; themeColor?: string }) => {
  return (
    <ThreeCanvas width={1920} height={1080}>
      <ambientLight intensity={1} />
      <SceneLogic seed={seed} themeColor={themeColor} />
    </ThreeCanvas>
  );
};
