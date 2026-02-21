import { getCommandContract } from './cli-first';

export function openClawManifest() {
  return {
    name: 'seo-tentacles',
    interfaceVersion: '1.0',
    commands: getCommandContract(),
  };
}
