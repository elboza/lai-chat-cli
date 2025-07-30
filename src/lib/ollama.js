import ollama from 'ollama';
import { get_messages, add_message } from '#root/src/history.js';
import { mcpt_call, get_tools } from '#root/src/mcp.js';

export const aichat = async (prompt, options) => {
  add_message({ role: 'user', content: prompt });
  const req = {
    model: options?.model || 'llama3.2',
    // system: systemPrompt,
    messages: get_messages(),
    stream: !!options?.stream,
    // format: "json",
    tools: options?.enable_mcp_tools ? get_tools() : undefined,
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
  if (response?.message?.content) {
    add_message(response.message);
  }

  if (!options?.stream) {
    if (response?.message.tool_calls) {
      console.log(options?.debug === true ? JSON.stringify(response) : JSON.stringify(response?.message.tool_calls));
      add_message({
        role: response?.message.role,
        content: JSON.stringify(response?.message.tool_calls),
      });
      if (options?.enable_mcpt_exec) {
        const tc = response?.message.tool_calls[0];
        await mcpt_call(tc.function.name, JSON.stringify(tc.function.arguments), options);
      }
      return;
    }
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
