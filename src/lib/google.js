import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { get_base_dir } from '#root/src/defaults.js';
import { get_messages, add_message } from '#root/src/history.js';
import { get_tools } from '#root/src/mcp.js';

const TOKENS_FILE = 'src/tokens/google_tokens.json';
let GEMINI_API_KEY = '';

let ai;
let chat_g;

export const read_tokens = () => {
  try {
    const fileContents = fs.readFileSync(`${get_base_dir()}/${TOKENS_FILE}`).toString();
    return JSON.parse(fileContents);
  } catch (e) {
    console.log('error reading tokens ...', e);
    return {};
  }
};
function hist_to_google(hist_list) {
  const roles_changes = { assistant: 'model' };
  return hist_list
    .map(x => ({
      role: roles_changes[x.role.toLowerCase()] || x.role,
      parts: [{ text: x.content }],
    }))
    .filter(x => x.role !== 'system');
}
function google_to_hist(hist_item) {
  const role_changes = { model: 'assistant', systeminstruction: 'system' };
  return {
    role: role_changes[hist_item.role.toLowerCase()] || hist_item.role,
    content: hist_item.content,
  };
}
function get_system_instructions() {
  const messages = get_messages();
  return messages
    .filter(x => x.role === 'system')
    .map(x => x.content)
    .join(' ');
}
export const init = async options => {
  try {
    GEMINI_API_KEY = read_tokens()?.GEMINI_API_KEY;
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.log('error init google provider ...', e);
  }
};

export const aigen = async (prompt, options) => {
  process.stdout.write('  Thinking ...\r');
  const response = await ai.models.generateContent({
    model: options?.model || 'gemini-2.5-flash',
    contents: prompt,
  });
  console.log(response.text);
};
export const aichat = async (prompt, options) => {
  process.stdout.write('  Thinking ...\r');
  if (options?.google_history) {
    if (!chat_g) {
      chat_g = ai.chats.create({
        model: options?.model || 'gemini-2.5-flash',
        history: [],
      });
    }
  } else {
    const req = {
      model: options?.model || 'gemini-2.5-flash',
      history: hist_to_google(get_messages()),
      config: {
        systemInstruction: get_system_instructions(),
//         tools: [{ function_declarations: get_tools() }],
//         toolConfig: {
//           functionCallingConfig: {
//             mode: 'ANY',
//             allowedFunctionNames: ['iaza__greetings'],
//           },
//         },
      },
    };
    if (options?.debug) {
  process.stdout.write('                    \r');
      console.log(req);
    }
    chat_g = ai.chats.create(req);
  }
  add_message({ role: 'user', content: prompt });
  const response = await chat_g.sendMessage({
    message: prompt,
  });
  process.stdout.write('                    \r');
  if (options?.show_model_name) {
    console.log(`[ ${response.modelVersion} ]:`);
  }
  if (options?.debug) {
    console.log(JSON.stringify(response));
  } else {
    console.log(response.text);
  }
  add_message(
    google_to_hist({
      role: response?.candidates[0]?.content?.role,
      content: response.text,
    }),
  );
};

export const get_models = async options => {
  const response = await ai.models.list();
  for await (const model of response) {
    if (options?.debug) {
      console.log(model);
    } else {
      console.log(model.name);
    }
  }
};
