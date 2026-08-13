import React from 'react';
import { Audio } from 'remotion';

export const AudioEngine = ({ audioData, category }: any) => {
  // Free public domain ambient cinematic tracks
  const bgmUrls: any = {
    technology: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    science: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    finance: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    default: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  };
  
  const trackUrl = bgmUrls[category] || bgmUrls.default;
  return <Audio src={trackUrl} volume={0.4} />;
};
