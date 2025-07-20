import got from 'got';
import fs from 'fs';
import { get_messages, add_message } from '#root/history.js';
import { get_base_dir } from '#root/defaults.js';

const TOKENS_FILE = 'tokens/copilot_tokens.json';

export const read_tokens = () => {
  try {
    const fileContents = fs.readFileSync(`${get_base_dir()}/${TOKENS_FILE}`).toString();
    return JSON.parse(fileContents);
  } catch (e) {
    console.log('error reading tokens ...', e);
    return {};
  }
};
const write_tokens = tokens => {
  try {
    const data = JSON.stringify(tokens);
    fs.writeFileSync(`${get_base_dir()}/${TOKENS_FILE}`, data);
  } catch (e) {
    console.log('error writing tokens ... ', e);
  }
};
const get_device_token = () => {
  // TODO ...  temporary use script ...
};
const get_access_token = () => {
  const access_token = read_tokens()?.access_token;
  if (access_token) {
    return access_token;
  }
  // TODO ... temporary use script
};
const get_chat_token = async (new_token = false) => {
  if (!new_token) {
    return read_tokens()?.chat_token;
  }
  const access_token = get_access_token();
  const req = {
    method: 'GET',
    url: 'https://api.github.com/copilot_internal/v2/token',
    headers: {
      'Content-Type': 'application/json',
      'Editor-Version': 'vscode/1.80.1',
      Authorization: `token ${access_token}`,
    },
  };
  try {
    // console.log('chat token req ...', req);
    const resp = await got(req).json();
    // console.log('chat token resp ...', resp);
    const tokens = read_tokens();
    tokens.chat_token = resp?.token;
    write_tokens(tokens);
    return resp?.token;
  } catch (e) {
    console.error('err ...', e);
    process.exit(1);
  }
};
const make_request = async (req, options) => {
  if (options?.debug) {
    console.log('req ...', req);
  }
  let retry = 2;
  while (retry > 0) {
    try {
      let resp;
      resp = options?.debug || options?.raw_output ? await got(req).text() : await got(req).json();
      if (options?.show_model_name) {
        console.log(`[ ${response.model} ]:`);
      }
      console.log(options?.debug || options?.raw_output ? resp : resp?.choices[0]?.message?.content);
      if (options.debug) {
        resp = JSON.parse(resp);
      }
      if (resp?.choices[0]?.message?.content) {
        add_message({
          role: resp.choices[0].message.role,
          content: resp.choices[0].message.content,
        });
      }
      retry = 0;
    } catch (e) {
      // console.error('err ...', e);
      console.log('...');
      retry--;
      const chat_token = await get_chat_token(true);
      req.headers.Authorization = `Bearer ${chat_token}`;
      if (retry === 0) {
        process.exit(1);
      }
    }
  }
};
export const get_models = async options => {
  const chat_token = await get_chat_token();
  const req = {
    method: 'GET',
    url: 'https://api.githubcopilot.com/models',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chat_token}`,
      'Editor-Version': 'vscode/1.80.1',
    },
  };
  await make_request(req, { ...options, raw_output: true });
};
export const ai_chat = async (prompt, options) => {
  const chat_token = await get_chat_token();
  add_message({ role: 'user', content: prompt });
  const req = {
    method: 'POST',
    url: 'https://api.githubcopilot.com/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chat_token}`,
      'Editor-Version': 'vscode/1.80.1',
    },
    body: JSON.stringify({
      intent: false,
      model: options?.model || 'gpt4-o',
      temperature: 0,
      top_p: 1,
      n: 1,
      stream: false,
      messages: get_messages(),
    }),
  };
  // console.log(req);
  await make_request(req, options);
};
