import { execSync } from 'child_process';
import JSON5 from 'json5';
import { read_config } from '#root/src/utils.js';

const SYN = { jsonrpc: '2.0', id: 1, method: 'initialize' };
const SYN_ACK = { jsonrpc: '2.0', id: 2, method: 'notifications/initialized' };
const TOOLS_LIST = { jsonrpc: '2.0', id: 'p1', method: 'tools/list' };
const RESOURCES_LIST = { jsonrpc: '2.0', id: 'p1', method: 'resources/list' };
const PROMPTS_LIST = { jsonrpc: '2.0', id: 'p1', method: 'prompts/list' };
const TOOLS_CALL = {
  method: 'tools/call',
  params: { name: 'cowsay', arguments: { mytext: 'pippo' } },
  jsonrpc: '2.0',
  id: 20,
};

const tools = [];
const servers = [];

export const get_tools = () => tools;

function get_message(msg) {
  msg.id = Date.now();
  return JSON.stringify(msg);
}
function get_server (name) {
	const server= servers.find(s=>s.server===name);
	return server?.data || null;
}

const send_stdio_data = (cli_cmd, input_str, options) => {
  try {
    // const resp=(execSync(cli_cmd, { input: input_str })).toString();
    const resp = execSync(`${cli_cmd} <<< '${input_str}'`).toString();
    if (options?.debug) {
      console.log(resp);
    }
    return resp ? JSON.parse(resp) : null;
  } catch (e) {
    console.log('err: ...', e);
    return null;
  }
};
function init_server(server, options) {
  const resp = send_stdio_data(server.command, get_message(SYN), options);
  if (resp.id !== SYN.id) {
    console.log('invalid mcp authentication ...');
    return null;
  }
  send_stdio_data(server.command, get_message(SYN_ACK), options);
  return true;
}

function get_tools_list(server, options) {
  const resp = send_stdio_data(server.command, get_message(TOOLS_LIST), options);
  if (
    resp.jsonrpc !== '2.0' ||
    resp.id !== TOOLS_LIST.id ||
    !resp.result.tools[0].name ||
    resp.result.tools[0].inputSchema?.type !== 'object' ||
    !resp.result.tools[0].inputSchema?.properties
  ) {
    return null;
  }
  return resp;
}

export const mcpt_call = (name, args, options) => {
  const [mcp_server, tool_name] = name.split('__');
  if (!mcp_server || !tool_name) {
    console.log('err ... server or tool name is missing');
    return;
  }
  if (!args) {
    args = '{}';
  }
  if (args) {
    try {
      args = JSON5.parse(args);
    } catch (e) {
      console.log('invalid args ... ', e);
      return null;
    }
  }
  TOOLS_CALL.params.name = tool_name;
  TOOLS_CALL.params.arguments = args;
  if (options?.debug) {
    console.log('call ...', get_message(TOOLS_CALL));
  }
  const resp = send_stdio_data(get_server(mcp_server)?.command, get_message(TOOLS_CALL), options);
  if (options?.debug) {
    console.log('resp ...', JSON.stringify(resp));
  }
  if (resp.jsonrpc !== '2.0' || resp.id !== TOOLS_CALL.id || resp.isError) {
    console.log('response error');
    return;
  }
  console.log(resp.result.content[0].text);
};

// eslint-disable-next-line import/prefer-default-export
export const load_mcp = options => {
  const mcp_servers = read_config()?.mcpServers;
  // console.log('mcp ...', mcp_servers);
  for (const server of Object.keys(mcp_servers)) {
    servers.push({server, data:mcp_servers[server]});
    if (mcp_servers[server].type === 'stdio') {
      if (init_server(mcp_servers[server], options)) {
        const resp = get_tools_list(mcp_servers[server], options);
        if (resp?.result?.tools) {
          resp.result.tools.forEach(t => {
            tools.push({
              type: 'function',
              function: {
                name: `${server}__${t.name}`,
                description: t.description,
                parameters: {
                  ...t.inputSchema,
                },
              },
            });
          });
        }
      }
    }
  }
};

// for each server:
// if server.type === stdio
// init server -> get tools list (and other list) and save it to the server struct
// ready to call tool ...
//
// curl https://api.openai.com/v1/chat/completions \
//   -X POST \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $OPENAI_API_KEY" \
//   -d @- <<EOF
// {
//   "model": "gpt-4o",
//   "messages": [
//     {
//       "role": "user",
//       "content": "What is the weather like in Boston?"
//     }
//   ],
//   "tools": [
//     {
//       "type": "function",
//       "function": {
//         "name": "get_current_weather",
//         "description": "Get the current weather for a specific location",
//         "parameters": {
//           "type": "object",
//           "properties": {
//             "location": {
//               "type": "string",
//               "description": "The city and state, e.g., San Francisco, CA"
//             }
//           },
//           "required": ["location"]
//         }
//       }
//     }
//   ]
// }
// EOF
//
//
// ```json
// {
//   "id": "chatcmpl-...",
//   "object": "chat.completion",
//   "created": 1716816278,
//   "model": "gpt-4o-2024-05-13",
//   "choices": [
//     {
//       "index": 0,
//       "message": {
//         "role": "assistant",
//         "content": null,
//         "tool_calls": [
//           {
//             "id": "call_abc123...",
//             "type": "function",
//             "function": {
//               "name": "get_current_weather",
//               "arguments": "{\"location\":\"Boston\"}"
//             }
//           }
//         ]
//       },
//       "finish_reason": "tool_calls"
//     }
//   ],
//   "usage": { ... }
// }
// ```
