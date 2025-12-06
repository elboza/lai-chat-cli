import { init_providers, repl } from '#root/src/repl.js';
import { cmd_parse } from '#root/src/cmd_parse.js';
import { load_mcp } from '#root/src/mcp.js';

async function init(options) {
  await init_providers(options);
}

(async function main() {
  const options = cmd_parse(process.argv);
  await init(options);
  if (options?.enable_mcp_tools) {
    await load_mcp(options);
  }
  await repl(options);
})();
