import { repl } from '#root/repl.js';
import { cmd_parse } from '#root/cmd_parse.js';
import { init as google_init } from '#root/lib/google.js';

async function init(options) {
  if (options?.provider === 'google') {
    await google_init(options);
  }
}

(async function main() {
  const options = cmd_parse(process.argv);
  await init(options);
  await repl(options);
})();
