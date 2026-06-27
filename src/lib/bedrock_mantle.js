import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { getTokenProvider } from '@aws/bedrock-token-generator';
import { get_messages, add_message } from '#root/src/history.js';
import { mcpt_call, get_tools } from '#root/src/mcp.js';

const provideToken = getTokenProvider();
let ai_client;

const AWS_REGION = 'eu-west-1';

function is_anthropic(modelname) {
  return modelname?.includes('anthropic');
}

function tools_to_bedrock(tools, modelname) {
  if (!is_anthropic(modelname)) {
    return tools;
  }
  return tools.map(t => {
    const ret = { ...t.function };
    ret.input_schema = ret.parameters;
    delete ret.parameters;
    return ret;
  });
}

export const init = async (options, force = false) => {
  try {
    if (ai_client && !force) {
      return;
    }
    if (!process.env.AWS_REGION) {
      process.env.AWS_REGION = AWS_REGION;
    }
    if (is_anthropic(options.model)) {
      ai_client = new Anthropic({
        apiKey: await provideToken(),
        baseURL: `https://bedrock-mantle.${process.env.AWS_REGION}.api.aws/anthropic`,
        defaultHeaders: {
          'anthropic-workspace-id': options.bedrock_mantle_project,
        },
      });
    } else {
      ai_client = new OpenAI({
        baseURL: `https://bedrock-mantle.${process.env.AWS_REGION}.api.aws/v1`,
        apiKey: await provideToken(),
        defaultHeaders: { 'OpenAI-Project': options.bedrock_mantle_project },
      });
    }
  } catch (e) {
    console.log('error init bedrock provider ...', e);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const aichat = async (prompt, options) => {
  process.stdout.write('  Thinking ...\r');
  add_message({ role: 'user', content: prompt });
  const req = {
    model: options?.model || 'anthropic.claude-opus-4-8',
    system: is_anthropic(options?.model)
      ? get_messages()
          .filter(message => message.role === 'system')
          .map(m => m.content)
          .join(' ')
      : undefined,
    messages: is_anthropic(options?.model) ? get_messages().filter(m => m.role !== 'system') : get_messages(),
    max_tokens: 1024,
    tools: options?.enable_mcp_tools ? tools_to_bedrock(get_tools(), options.model) : undefined,
  };
  if (options?.debug) {
    process.stdout.write('                    \r');
    console.log(JSON.stringify(req));
  }
  let response;
  let answer;
  let role;
  let resp_type;
  if (is_anthropic(options.model)) {
    response = await ai_client.messages.create(req);
    role = response?.role;
    answer = response?.content[0]?.text;
    resp_type = response.content[0]?.type;
  } else {
    response = await ai_client.chat.completions.create(req);
    role = response?.choices[0]?.message?.role;
    answer = response?.choices[0]?.message?.content;
    resp_type = response?.choices[0]?.finish_reason;
  }

  process.stdout.write('                    \r');
  if (options?.show_model_name) {
    console.log(`[ ${response.model} ]:`);
  }
  if (resp_type === 'tool_use' || resp_type === 'tool_calls') {
    const tc = is_anthropic(options.model) ? response?.content[0] : response?.choices[0]?.message?.tool_calls[0];
    add_message({
      role,
      content: JSON.stringify(tc),
    });
    console.log(options?.debug === true ? JSON.stringify(response) : JSON.stringify(tc));
    if (options?.enable_mcpt_exec) {
      await mcpt_call(
        is_anthropic(options?.model) ? tc.name : tc.function.name,
        is_anthropic(options?.model) ? tc.input : tc.function.arguments,
        options,
      );
    }
    return;
  }
  console.log(options?.debug ? JSON.stringify(response) : answer);
  add_message({
    role,
    content: answer,
  });
};

export const get_models = async options => {
  const bedrock = new BedrockClient({
    region: process.env.AWS_REGION || 'eu-west-1',
  });
  const { modelSummaries } = await bedrock.send(new ListFoundationModelsCommand({ byProvider: 'Anthropic' }));

  for (const m of modelSummaries ?? []) {
    if (options?.debug) {
      console.log(m); // e.g. anthropic.claude-3-haiku-20240307-v1:0
    } else {
      console.log(`${m.modelId} [ ${m.modelName} ]`); // e.g. anthropic.claude-3-haiku-20240307-v1:0
    }
  }
};
