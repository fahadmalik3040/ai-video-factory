import { run3DAISwarm } from './generate_3d_swarm';

export async function generate3DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  return run3DAISwarm(topic, jobIdx);
}

if (require.main === module) {
  generate3DMetadata();
}
