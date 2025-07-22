import { Command } from 'commander';
import fs from 'fs';
import { get_base_dir, get_default_provider, get_default_model } from '#root/defaults.js';
import { add_message } from '#root/history.js';

const program = new Command();
const CONFIG_FILE = 'lai_config.json';

function read_config() {
  let fileContents;
  try {
    fileContents = fs.readFileSync(`${get_base_dir()}/${CONFIG_FILE}`).toString();
  } catch (e) {
    // console.log('error opening config file ...', e);
    return {};
  }
  try {
    if (fileContents) {
      return JSON.parse(fileContents);
    }
    return {};
  } catch (e) {
    console.log('error reading config file ...', e);
    return {};
  }
}

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
    .option('-f, --system-prompt <string>')
    .option('-n, --show-model-name')
    .option('-s, --stream');

  program.parse(args);

  const options = program.opts();
  let provider = options?.provider;
  let model = options?.model;
  if (!provider) {
    provider = get_default_provider();
  }
  if (!model) {
    model = get_default_model(provider);
  }
  const conf = read_config();
  const system_prompt = get_system_prompt(options?.systemPrompt);
  if (system_prompt) {
    add_message({ role: 'system', content: system_prompt });
  }
  const parsed_options = {
    model: options.model || conf.model || get_default_model(get_default_provider()),
    provider: options.provider || conf.provider || get_default_provider(),
    debug: !!options.debug || !!conf.debug,
    system_prompt,
    stream: !!options.stream || !!conf.stream,
    show_model_name: !!options.showModelName || !!conf.show_model_name,
  };
  if (parsed_options.debug) {
    console.log('cmd options:', options, parsed_options);
  }
  return parsed_options;
};
