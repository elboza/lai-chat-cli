import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { get_messages, add_message } from '#root/src/history.js';
import { mcpt_call, get_tools } from '#root/src/mcp.js';

let ai;

function tools_to_bedrock(tools) {
  return tools.map(t => {
    const ret = { ...t.function };
    ret.input_schema = ret.parameters;
    delete ret.parameters;
    return ret;
  });
}

export const init = async options => {
  try {
    // Note: this assumes you have configured AWS credentials in a way
    // that the AWS Node SDK will recognise, typicaly a shared `~/.aws/credentials`
    // file or `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` environment variables.
    // (otherwise use Custom Credential Provider .... )
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html
    if (ai) {
      return;
    }
    if (!process.env.AWS_REGION) {
      process.env.AWS_REGION = 'eu-west-1';
    }
    ai = new AnthropicBedrock();
  } catch (e) {
    console.log('error init bedrock provider ...', e);
  }
};

export const aichat = async (prompt, options) => {
  process.stdout.write('  Thinking ...\r');
  add_message({ role: 'user', content: prompt });
  const req = {
    model: options?.model || 'anthropic.claude-sonnet-4-5-20250929-v1:0',
    messages: get_messages(),
    max_tokens: 1024,
    tools: options?.enable_mcp_tools ? tools_to_bedrock(get_tools()) : undefined,
  };
  if (options?.debug) {
    process.stdout.write('                    \r');
    console.log(JSON.stringify(req));
  }
  const response = await ai.messages.create(req);

  process.stdout.write('                    \r');
  if (options?.show_model_name) {
    console.log(`[ ${response.model} ]:`);
  }
  if (response.content[0]?.type === 'tool_use') {
    add_message({
      role: response.role,
      content: JSON.stringify(response.content),
    });
    console.log(options?.debug === true ? JSON.stringify(response) : JSON.stringify(response?.content[0]));
    if (options?.enable_mcpt_exec) {
      const tc = response?.content[0];
      await mcpt_call(tc.name, tc.inout, options);
    }
    return;
  }
  console.log(options?.debug ? JSON.stringify(response) : response.content[0]?.text);
  add_message({
    role: response?.role,
    content: response.content[0]?.text,
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

export const ai_embeddings = async (texts, options) => {
  const response = await ai.models.embedContent({
    model: options.rag_model || 'gemini-embedding-001',
    contents: typeof texts === 'string' ? [texts] : texts,
    taskType: 'SEMANTIC_SIMILARITY',
  });
  const embeddings = response.embeddings.map(e => e.values);
  return embeddings;
};
