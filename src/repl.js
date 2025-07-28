import readline from 'node:readline/promises';
import { execSync } from 'child_process';
import fs from 'fs';
import { aichat, aigen } from '#root/src/lib/ollama.js';
import { ai_chat, get_models } from '#root/src/lib/copilot.js';
import {
  get_models as google_get_models,
  aichat as google_aichat,
  aigen as google_aigen,
} from '#root/src/lib/google.js';
import { refresh_chat, add_message, reset_messages } from '#root/src/history.js';
import { mcpt_call, get_tools } from '#root/src/mcp.js';

const instr = {
  CMD_HELP: {
    name: '/help',
    desc: 'this help',
  },
  CMD_QUIT: {
    name: '/quit',
    desc: 'exit the repl',
  },
  CMD_BYE: {
    name: '/bye',
    desc: 'exit the repl',
  },
  CMD_DEBUG: {
    name: '/debug',
    desc: 'toggle debug info',
  },
  CMD_INFO: {
    name: '/info',
    desc: 'show current settings',
  },
  CMD_NEWCHAT: {
    name: '/newchat',
    desc: 'start a new chat',
  },
  CMD_STREAM: {
    name: '/stream',
    desc: 'toggle stream chat',
  },
  CMD_CMD: {
    name: '/cmd',
    desc: 'execute a shell command (showing its original output) and submit its output to the model',
  },
  CMD_NCMD: {
    name: '/ncmd',
    desc: 'execute a shell command (not showing its original output) and submit its output to the model',
  },
  CMD_SYSTEM: {
    name: '/system',
    desc: 'add a chat system info',
  },
  CMD_FILESUBMIT: {
    name: '/filesubmit',
    desc: 'read a file content and sent it to the model as an input',
  },
  CMD_FILE: {
    name: '/file',
    desc: 'read a file and add it it the chat system info',
  },
  CMD_NEWMODEL: {
    name: '/newmodel',
    desc: 'set a new model. the format is provider:model',
  },
  CMD_MODELS: {
    name: '/models',
    desc: 'show available models',
  },
  CMD_SHOWMODELNAME: {
    name: '/showmodelname',
    desc: 'toggle show model name in response',
  },
  CMD_REFRESH: {
    name: '/refresh',
    desc: 'print again all chat logs to console',
  },
  CMD_MCPTOOLS: {
    name: '/mcptools',
    desc: 'list loaded mcp tools',
  },
  CMD_MCPT_CALL: {
    name: '/mcpt_call',
    desc: 'direct call to a tool (/mcpt_call tool_name {...params})',
  },
  CMD_MCPT_SWITCH: {
    name: '/mcpt_switch',
    desc: 'toggle mcp tools enable/disable',
  },
  CMD_MCPT_EXEC_SWITCH: {
    name: '/mcpt_exec_switch',
    desc: 'toggle mcp tools function execution',
  },
};
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
    const commands_list = Object.values(instr).map(x => x.name);
    if (answer.startsWith('/') && !commands_list.some(x => answer.startsWith(x))) {
      console.log('invalid or incorrect command.');
      continue;
    }
    if (answer === instr.CMD_DEBUG.name) {
      debug = !debug;
      options.debug = debug;
      continue;
    }
    if (answer === instr.CMD_INFO.name) {
      console.log(options);
      continue;
    }
    if (answer === instr.CMD_NEWCHAT.name) {
      reset_messages();
      continue;
    }
    if (answer === instr.CMD_QUIT.name || answer === instr.CMD_BYE.name) {
      break;
    }
    if (answer === instr.CMD_STREAM.name) {
      options.stream = !options.stream;
      continue;
    }
    if (answer === instr.CMD_SHOWMODELNAME.name) {
      options.show_model_name = !options.show_model_name;
      continue;
    }
    if (answer === instr.CMD_REFRESH.name) {
      refresh_chat(options);
      continue;
    }
    if (answer === instr.CMD_MCPTOOLS.name) {
      // console.log(get_tools());
      get_tools().forEach(t => {
        console.log(`${t.function.name} : ${t.function.description}`);
        console.log(`  - props: ${JSON.stringify(t.function.parameters.properties)}`);
        console.log(`  - required: ${JSON.stringify(t.function.parameters.required)}`);
      });
      continue;
    }
    if (answer === instr.CMD_MCPT_SWITCH.name) {
      options.enable_mcp_tools = !options.enable_mcp_tools;
      continue;
    }
    if (answer === instr.CMD_MCPT_EXEC_SWITCH.name) {
      options.enable_mcpt_exec = !options.enable_mcpt_exec;
      continue;
    }
    if (answer === instr.CMD_HELP.name) {
      console.log('available commands:');
      for (const item of Object.keys(instr)) {
        console.log(`${instr[item].name} : ${instr[item].desc}`);
      }
      continue;
    }
    const [command, ...args] = answer.split(' ');
    if (command === instr.CMD_CMD.name) {
      console.log('exec ...', args.join(' '));
      answer = execSync(args.join(' ')).toString();
      console.log(answer);
    }
    if (command === instr.CMD_NCMD.name) {
      console.log('exec ...', args.join(' '));
      answer = execSync(args.join(' ')).toString();
    }
    if (command === instr.CMD_SYSTEM.name) {
      add_message({ role: 'system', content: args.join(' ') });
      continue;
    }
    if (command === instr.CMD_FILESUBMIT.name) {
      const data = read_file(args.join(' '));
      if (!data) {
        console.log('err reading file ...');
      }
      answer = data;
    }
    if (command === instr.CMD_FILE.name) {
      const data = read_file(args.join(' '));
      if (!data) {
        console.log('err reading file ...');
      }
      add_message({ role: 'system', content: data });
      continue;
    }
    if (command === instr.CMD_NEWMODEL.name) {
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
    if (command === instr.CMD_MCPT_CALL.name) {
      const name = args.shift();
      const params = args.join(' ');
      mcpt_call(name, params, options);
      continue;
    }
    // await aichat(answer, options);
    switch (options.provider) {
      case 'copilot':
        if (answer === instr.CMD_MODELS.name) {
          await get_models(options);
          continue;
        }
        await ai_chat(answer, options);
        break;
      case 'google':
        if (answer === instr.CMD_MODELS.name) {
          await google_get_models(options);
          continue;
        }
        // await google_aigen(answer, options);
        await google_aichat(answer, options);
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
