import { Command } from 'commander';
import {get_default_provider, get_default_model} from './defaults.js';
const program = new Command();

export const cmd_parse=(args) => {
program
  .option('-d, --debug')
  .option('-p, --provider <string>')
  .option('-m, --model <string>')

program.parse(args);

const options = program.opts();
	let provider=options?.provider;
	let model=options?.model;
	//let [provider,model]=options?.model?.split(':') || [null, null];
	if(!provider) {
		provider=get_default_provider();
	}
	if(!model) {
		model=get_default_model(provider);
	}
const parsed_options= {
	model,
	provider,
	debug: !!options.debug,
};
if(parsed_options.debug) {
	console.log('cmd options:', options, parsed_options);
}
return parsed_options;
};

