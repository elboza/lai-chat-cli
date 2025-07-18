import { Command } from 'commander';
import fs from 'fs';
import { get_default_provider, get_default_model } from '#root/defaults.js';
import { add_message } from '#root/history.js';

const program = new Command();

function get_system_prompt(sprompt) {
  if (!sprompt) {
    return;
  }
  if (sprompt.split(' ').length > 1) {
    return sprompt;
  }
  try {
    const fileContents = fs.readFileSync(sprompt).toString();
    return fileContents;
  } catch (e) {
    return sprompt;
  }
}

// eslint-disable-next-line import/prefer-default-export
export const cmd_parse = args => {
  program
    .option('-d, --debug')
    .option('-p, --provider <string>')
    .option('-m, --model <string>')
    .option('-f, --system-prompt <string>');

  program.parse(args);

  const options = program.opts();
  let provider = options?.provider;
  let model = options?.model;
  // let [provider,model]=options?.model?.split(':') || [null, null];
  if (!provider) {
    provider = get_default_provider();
  }
  if (!model) {
    model = get_default_model(provider);
  }
  const system_prompt = get_system_prompt(options?.systemPrompt);
  if (system_prompt) {
    add_message({ role: 'system', content: system_prompt });
  }
  const parsed_options = {
    model,
    provider,
    debug: !!options.debug,
    system_prompt,
  };
  if (parsed_options.debug) {
    console.log('cmd options:', options, parsed_options);
  }
  return parsed_options;
};
