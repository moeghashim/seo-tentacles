import { deployToVercel } from '../seo/infra/vercel';

export async function deployProgrammatic(project: string, scope: 'preview' | 'production') {
  return deployToVercel({ project, scope });
}
