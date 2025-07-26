import { fileURLToPath } from 'url';
import { dirname } from 'path';

const providers = Object.freeze({
  OLLAMA: 'ollama',
  COPILOT: 'copilot',
  GOOGLE: 'google',
});
const default_models = Object.freeze({
  ollama: 'llama3.2',
  copilot: 'gpt-4o',
  google: 'gemini-2.5-flash',
});
export const get_default_provider = () => providers.COPILOT;

export const get_default_model = provider => default_models[provider] || 'null';

export const get_base_dir = () => {
  const filename = fileURLToPath(import.meta.url);
  const curdir = dirname(filename);

  return curdir.replace(/\/src$/,'');
};
