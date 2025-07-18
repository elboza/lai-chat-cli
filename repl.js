import readline from 'node:readline/promises';
import { execSync } from 'child_process';
import fs from 'fs';
import { aichat, aigen } from '#root/api/ollama.js';
import { ai_chat, get_models } from '#root/api/copilot.js';
import { add_message, reset_messages } from '#root/history.js';

function read_file(filename) {
  try {
    const fileContents = fs.readFileSync(filename).toString();
    return fileContents;
  } catch (e) {
    console.log('f1 err ...', e);
    return null;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let debug = false;

// eslint-disable-next-line import/prefer-default-export
export const repl = async options => {
  debug = options?.debug;
  while (true) {
    let answer = (await rl.question('>>> '))?.trim();
    if (!answer) {
      continue;
    }
    if (answer === '/debug') {
      debug = !debug;
      options.debug = debug;
      continue;
    }
    if (answer === '/info') {
      console.log(options);
      continue;
    }
    if (answer === '/newchat') {
      reset_messages();
      continue;
    }
    if (answer === '/quit' || answer === '/bye') {
      break;
    }
    if (answer === '/help') {
      console.log('available commands:');
      console.log('/quit or /bye : exit the repl');
      console.log('/debug : toggle debug info');
      console.log('/info : show current settings');
      console.log('/newchat : start a new chat');
      console.log('/help : this help');
      console.log('/cmd : execute a shell command (showing its original output) and submit its output to the model');
      console.log(
        '/ncmd : execute a shell command (not showing its original output) and submit its output to the model',
      );
      console.log('/system : add a chat system info');
      console.log('/filesubmit : read a file content and sent it to the model as an input');
      console.log('/file : read a file and add it it the chat system info');
      console.log('/newmodel : set a new model. the format is provider:model');
      console.log('/models : show available models');
      continue;
    }
    const [command, ...args] = answer.split(' ');
    if (command === '/cmd') {
      console.log('exec ...', args.join(' '));
      answer = (await execSync(args.join(' '))).toString();
      console.log(answer);
    }
    if (command === '/ncmd') {
      console.log('exec ...', args.join(' '));
      answer = (await execSync(args.join(' '))).toString();
    }
    if (command === '/system') {
      add_message({ role: 'system', content: args.join(' ') });
      continue;
    }
    if (command === '/filesubmit') {
      const data = read_file(args.join(' '));
      if (!data) {
        console.log('err reading file ...');
      }
      answer = data;
    }
    if (command === '/file') {
      const data = read_file(args.join(' '));
      if (!data) {
        console.log('err reading file ...');
      }
      add_message({ role: 'system', content: data });
      continue;
    }
    if (command === '/newmodel') {
      const [provider, model] = args.join(' ').split(':');
      console.log('model ...', provider, model);
      if (!provider || !model) {
        console.log('invalid new model.');
        continue;
      }
      options.model = model;
      options.provider = provider;
      continue;
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
        // await aigen(answer, options);
        await aichat(answer, options);
        break;
    }
  }
  console.log('bye.');
  rl.close();
};
