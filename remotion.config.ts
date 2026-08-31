import { Config } from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle');
Config.setChromiumFlags([
  '--use-angle=swiftshader',
  '--disable-gpu'
]);
