import { repl } from '#root/repl.js';
import { cmd_parse } from '#root/cmd_parse.js';

(async function main() {
  const options = cmd_parse(process.argv);
  await repl(options);
})();
