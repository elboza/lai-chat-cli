import { repl } from './repl.js';
import { cmd_parse } from './cmd_parse.js';

(async function main() {
  const options = cmd_parse(process.argv);
  await repl(options);
})();
