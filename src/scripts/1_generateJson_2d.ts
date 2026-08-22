import { run2DAISwarm } from './generate_2d_swarm';

export async function generate2DMetadata(topic?: string, jobIdx?: number): Promise<any> {
  return run2DAISwarm(topic, jobIdx);
}

if (require.main === module) {
  generate2DMetadata();
}
