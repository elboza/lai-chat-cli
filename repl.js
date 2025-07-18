import readline from 'node:readline/promises';
import { aichat, aigen } from '#root/api/ollama.js';
import { ai_chat, get_models } from '#root/api/copilot.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let debug = false;

// eslint-disable-next-line import/prefer-default-export
export const repl = async options => {
  debug = options?.debug;
  while (true) {
    const answer = (await rl.question('>>> '))?.trim();
    if (answer === '/debug') {
      debug = !debug;
      options.debug = debug;
      continue;
    }
    if (answer === '/info') {
      console.log(options);
      continue;
    }
    if (answer === '/quit') {
      break;
    }
    // await aichat(answer, options);
    switch (options.provider) {
      case 'copilot':
        if (answer === '/models') {
          await get_models(options);
          continue;
        }
        await ai_chat(answer, options);
        break;
      case 'ollama':
      default:
        //await aigen(answer, options);
        await aichat(answer, options);
        break;
    }
  }
  console.log('bye.');
  rl.close();
};
