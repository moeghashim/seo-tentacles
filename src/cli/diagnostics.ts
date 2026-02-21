export interface RuntimeInfo {
  node: string;
  platform: string;
  arch: string;
  cwd: string;
}

export function getRuntimeInfo(): RuntimeInfo {
  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
  };
}
