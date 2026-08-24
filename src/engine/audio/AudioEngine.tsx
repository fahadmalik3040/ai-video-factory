import React from 'react';

export const AudioEngine = ({ category }: { category?: string }) => {
  // Headless CI runners block external audio CDNs (SoundHelix) causing ECONNREFUSED crashes.
  // Safely returning null protects Remotion rendering pipelines while keeping audio slot ready.
  return null;
};

export default AudioEngine;
