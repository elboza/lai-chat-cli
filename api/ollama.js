import ollama from 'ollama';
import { get_messages, add_message } from '#root/history.js';

export const aichat = async (prompt, options) => {
  console.log(`\n<thinking ...>\n`);
  add_message({ role: 'user', content: prompt });
  const req = {
    model: options?.model || 'llama3.2',
    // system: systemPrompt,
    messages: get_messages(),
    stream: false,
    // format: "json",
  };
  if (options?.debug) {
    console.log('req ...', req);
  }
  const response = await ollama.chat(req);
  if (response?.message) {
    add_message(response.message);
  }

  // console.log(response.message?.tool_calls);
  console.log(options?.debug === true ? response : response?.message?.content);
  console.log('');
  //  const responseObject = JSON.parse(response.response.trim());
  //  executeFunction(responseObject.functionName, responseObject.parameters);
};

export const aigen = async (prompt, options) => {
  console.log(`\n<thinking ...>\n`);
  const req = {
    model: options?.model || 'llama3.2',
    // system: systemPrompt,
    prompt,
    stream: false,
    // format: "json",
  };
  if (options?.debug) {
    console.log('req ...', req);
  }
  const response = await ollama.generate(req);

  console.log(options?.debug ? response : response?.response);
  console.log('');
  //  const responseObject = JSON.parse(response.response.trim());
  //  executeFunction(responseObject.functionName, responseObject.parameters);
};
