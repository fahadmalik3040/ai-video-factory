import React from 'react';
import { Composition } from 'remotion';
import { SceneRouter } from './components/SceneRouter';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={SceneRouter}
        durationInFrames={1200}
        fps={30}
        width={3840}
        height={2160}
      />
    </>
  );
};

export default RemotionRoot;
