# LAI - Local AI cli

a simple AI swiss knife cli tool

### install

clone the repo or download the source and then:

install dependencies

```
npm i
```

optionally install globally

```
npm i -g
```

### setup

create `lai_config.json` from the `lai_config.template` and modify it to your preferred startup setup.

### providers setup

#### copilot

run `copilot_auth.sh` located into the `scripts` directory, and copy the ACCESS_TOKEN into the ACCESS_TOKEN field in the `tokens/copilot_tokens.json` creates from the `tokens/copilot_tokens.json.template` file. (if you see 'null' value in Copilot token then you will need to enable copilot into your github account page.)

#### ollama

download ollama and run it with `ollama serve`

#### google

get google ai api key from google ai portal, and place it into `tokens/google_tokens.js` created from the `tokens/google_tokens.json.template` file

### run

```
lai --help
Usage: lai [options]

Options:
  -d, --debug
  -p, --provider <string>
  -m, --model <string>
  -f, --system-prompt <string>
  -n, --show-model-name
  -s, --stream
  -h, --help                    display help for command
```

just run `lai` to enter the cli mode:

and type `/help` to see all available commands or just start typying to interact with your AI.

```
lai
>>> /help
available commands:
/help : this help
/quit : exit the repl
/bye : exit the repl
/debug : toggle debug info
/info : show current settings
/newchat : start a new chat
/stream : toggle stream chat
/cmd : execute a shell command (showing its original output) and submit its output to the model
/ncmd : execute a shell command (not showing its original output) and submit its output to the model
/system : add a chat system info
/filesubmit : read a file content and sent it to the model as an input
/file : read a file and add it it the chat system info
/newmodel : set a new model. the format is provider:model
/models : show available models
/showmodelname : toggle show model name in response
/refresh : print again all chat logs to console
```

### MCP

coming soon ...... MCP is not YET integrated in lai .

### licence: L-Beerware

The L-Beerware license
PREAMBLE:
L-Beerware (also known as LBeerware or lbeerware) is a lesser Beerware license originally written by Poul-Henning Kamp.

LICENSE:

```
/*
 * ----------------------------------------------------------------------------
 * "THE L-BEERWARE LICENSE" (Revision 42):
 * This stuff comes with NO WARRANTY. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy the author a beer in return.
 * ----------------------------------------------------------------------------
 */
 ```

