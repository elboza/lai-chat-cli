import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import JSON5 from 'json5';
import { read_config } from '#root/src/utils.js';

let tools = [];
let servers = [];

export const get_tools = () => tools;

function get_server(name) {
  const server = servers.find(s => s.server === name);
  return server || null;
}

async function connect_to_stdio(server, options) {
  try {
    const transport = new StdioClientTransport({
      command: server.command,
      args: server.args || [],
    });

    const client = new Client({
      name: 'lai',
      version: '0.0.1',
    });

    await client.connect(transport);
    return { client, transport };
  } catch (e) {
    if (options?.debug) {
      console.log('error connecting to server ...', e);
    }
    return null;
  }
}

export const mcpt_call = async (name, args, options) => {
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
      if (typeof args === 'string') {
        args = JSON5.parse(args);
      }
    } catch (e) {
      console.log('invalid args ... ', e);
      return null;
    }
  }
  console.log(' tool call ...', mcp_server, tool_name, args);
  const resp = await get_server(mcp_server)?.connection.client.callTool({
    name: tool_name,
    arguments: args,
  });
  if (options?.debug) {
    console.log('resp ...', JSON.stringify(resp));
  }
  console.log(resp.content[0].text);
};

export const load_mcp = async options => {
  const mcp_servers = read_config()?.mcpServers;
  if (!mcp_servers) {
    return;
  }
  // console.log('mcp ...', mcp_servers);
  for (const server of Object.keys(mcp_servers)) {
    // servers.push({ server, data: mcp_servers[server] });
    let connection = null;
    if (mcp_servers[server].command) {
      connection = await connect_to_stdio(mcp_servers[server], options);
    }
    if (mcp_servers[server].httpUrl) {
      // connect to url ...
    }
    if (!connection) {
      console.log('error connecting to ', server);
    }
    servers.push({ server, mcp: mcp_servers[server], connection });
    if (connection) {
      // get mcp tools ...
      if (options?.debug) {
        console.log('connected to ...', server);
      }
      const resp = await connection.client.listTools();
      if (resp?.tools) {
        resp.tools.forEach(t => {
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
};
export const free_mcp = async options => {
  if (options?.debug) {
    console.log('free mcp ...');
  }
  for (const server of servers) {
    if (server.connection) {
      await server.connection.transport.close();
    }
  }
  servers = [];
  tools = [];
};
