// import * as cosineSimilarity from 'compute-cosine-similarity';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { get_base_dir } from '#root/src/defaults.js';
import { get_messages, add_message } from '#root/src/history.js';
import { mcpt_call, get_tools } from '#root/src/mcp.js';

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
function tools_to_google(tools) {
  return [{ functionDeclarations: tools.map(t => t.function) }];
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
        tools: options?.enable_mcp_tools ? tools_to_google(get_tools()) : undefined,
      },
    };
    if (options?.debug) {
      process.stdout.write('                    \r');
      console.log(JSON.stringify(req));
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
  if (response?.candidates[0]?.content?.parts[0]?.functionCall) {
    console.log(
      options?.denug === true
        ? JSON.stringify(response)
        : JSON.stringify(response?.candidates[0]?.content?.parts[0]?.functionCall),
    );
    add_message(
      google_to_hist({
        role: response?.candidates[0]?.content?.role,
        content: JSON.stringify(response?.candidates[0]?.content?.parts[0]?.functionCall),
      }),
    );
    if (options?.enable_mcpt_exec) {
      const tc = response?.candidates[0]?.content?.parts[0];
      await mcpt_call(tc.functionCall.name, tc.functionCall.args, options);
    }
    return;
  }
  console.log(options?.debug ? JSON.stringify(response) : response.text);
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

export const ai_embeddings = async (texts, options) => {
  const response = await ai.models.embedContent({
    model: options.rag_model || 'gemini-embedding-001',
    contents: typeof texts === 'string' ? [texts] : texts,
    taskType: 'SEMANTIC_SIMILARITY',
  });
  const embeddings = response.embeddings.map(e => e.values);
  return embeddings;
};
