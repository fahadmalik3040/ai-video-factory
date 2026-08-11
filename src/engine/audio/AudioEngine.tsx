import React from "react";
import {Audio, staticFile} from "remotion";

type AudioEngineProps = {
  audioData: any;
};

const remoteTestTrack = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const AudioEngine: React.FC<AudioEngineProps> = ({audioData}) => {
  const audioSource = audioData?.useLocalFile ? staticFile("bgm.mp3") : remoteTestTrack;

  return <>{audioData?.bgmStyle ? <Audio src={audioSource} volume={0.5} /> : null}</>;
};
