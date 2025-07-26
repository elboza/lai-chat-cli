import ollama from 'ollama';
import { get_messages, add_message } from '#root/history.js';
import { get_tools } from '#root/mcp.js';

export const aichat = async (prompt, options) => {
  add_message({ role: 'user', content: prompt });
  const req = {
    model: options?.model || 'llama3.2',
    // system: systemPrompt,
    messages: get_messages(),
    stream: !!options?.stream,
    // format: "json",
    //	tools: get_tools(),
  };
  if (options?.debug) {
    console.log('req ...', req);
  }
  process.stdout.write('  Thinking ...\r');
  const response = await ollama.chat(req);
  process.stdout.write('                  \r');
  if (options?.show_model_name) {
    console.log(`[ ${response.model} ]:`);
  }
  if (options?.stream) {
    const streamed = { role: '', content: '' };
    for await (const chunk of response) {
      process.stdout.write(chunk?.message?.content);
      streamed.content += chunk?.message?.content;
      streamed.role = chunk?.message?.role;
    }
    response.message = streamed;
  }
  if (response?.message) {
    add_message(response.message);
  }

  if (!options?.stream) {
    console.log(options?.debug === true ? response : response?.message?.content);
  }
  console.log('');
};

export const aigen = async (prompt, options) => {
  process.stdout.write('  Thinking ...\r');
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
  if (options?.show_model_name) {
    console.log(`[ ${response.model} ]:`);
  }

  console.log(options?.debug ? response : response?.response);
  console.log('');
};
