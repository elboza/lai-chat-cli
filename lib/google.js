import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { get_base_dir } from '#root/defaults.js';
import { get_messages, add_message } from '#root/history.js';

const TOKENS_FILE = 'tokens/google_tokens.json';
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
  return hist_list.map(x => ({
    role: x.role.toLowerCase() === 'assistant' ? 'model' : x.role,
    parts: [{ text: x.content }],
  }));
}
function google_to_hist(hist_item) {
  return {
    role: hist_item.role.toLowerCase() === 'model' ? 'assistant' : hist_item.role,
    content: hist_item.content,
  };
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
  const response = await ai.models.generateContent({
    model: options?.model || 'gemini-2.5-flash',
    contents: prompt,
  });
  console.log(response.text);
};
export const aichat = async (prompt, options) => {
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
    };
    if (options?.debug) {
      console.log(req);
    }
    chat_g = ai.chats.create(req);
  }
  add_message({ role: 'user', content: prompt });
  const response = await chat_g.sendMessage({
    message: prompt,
  });
  if (options?.show_model_name) {
    console.log(`[ ${response.modelVersion} ]:`);
  }
  if (options?.debug) {
    console.log(JSON.stringify(response));
  } else {
    console.log(response.text);
  }
  // console.log(response, response.candidates[0].content.role, response.candidates[0].content.parts);
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
