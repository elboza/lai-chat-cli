import {repl} from './repl.js';
import {cmd_parse} from './cmd_parse.js';

const options=cmd_parse(process.argv);
await repl(options);
