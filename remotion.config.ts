/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// 1. OpenGL renderer ko 'angle' / 'swiftshader' pe set kar
Config.setChromiumOpenGlRenderer('angle');

// 2. Headless Chrome ko CPU rendering pe force kar jisse error na aaye
if (typeof (Config as any).setChromiumFlags === 'function') {
  (Config as any).setChromiumFlags([
    '--use-angle=swiftshader',
    '--disable-gpu'
  ]);
}
