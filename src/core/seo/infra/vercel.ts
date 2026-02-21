export interface VercelDeployOptions {
  project: string;
  scope: 'preview' | 'production';
}

export async function deployToVercel(options: VercelDeployOptions) {
  return {
    deploymentId: `dep_${Date.now().toString(36)}`,
    url: `https://${options.project}.vercel.app`,
    scope: options.scope,
    status: 'deployed',
    createdAt: new Date().toISOString(),
  };
}
