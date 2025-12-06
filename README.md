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

run `copilot_auth.sh` located into the `scripts` directory, and copy the ACCESS_TOKEN into the ACCESS_TOKEN field in the `src/tokens/copilot_tokens.json` creates from the `src/tokens/copilot_tokens.json.template` file. (if you see 'null' value in Copilot token then you will need to enable copilot into your github account page.)

#### ollama

download ollama (and set it up) and run it with `ollama serve`

#### google

get google ai api key from google ai portal, and place it into `src/tokens/google_tokens.js` created from the `src/tokens/google_tokens.json.template` file

#### bedrock

you should have configured AWS credentials in a way that the AWS Node SDK will recognise, typicaly a shared `~/.aws/credentials` file or `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` environment variables.

### run

```
$ lai --help
Usage: lai [options]

Options:
  -d, --debug
  -p, --provider <string>
  -m, --model <string>
  -f, --system-prompt <string>
  -n, --show-model-name
  -t, --mcp-tools
  -k, --mcp-tools-exec
  -s, --stream
  -r, --rag-file <string>
  -h, --help                    display help for command
```

just run `lai` to enter the cli mode:

and type `/help` to see all available commands or just start typing to interact with your AI.

```
$ lai
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
/newprovider : set a new provider.
/newmodel : set a new model.
/models : show available models
/showmodelname : toggle show model name in response
/refresh : print again all chat logs to console
/mcptools : list loaded mcp tools
/mcpt_call : direct call to a tool (/mcpt_call tool_name {...params})
/mcpt_switch : toggle mcp tools enable/disable
/mcpt_exec_switch : toggle mcp tools function execution
/rag_vect : generate an embedding vector
/rag_vect_add : add rag vector to mem
/rag_vect_list : list mem vector list
/rag_vect_rm : remove a vector from mem
/rag_lookup : submit your question to the model with your rag context
/rag_free : empty the rag mem db
/rag_vect_search : serch for rag items by text
/newragmodel : set a new model for rag. the format is provider:model
/rag_import_file : import file to rag
```

### MCP

partially implemented (only stdio transport layer for the moment).
MCP tools are disabled by default, but you can enable it at any time via command line flags (`-t` and `-k`), config file (`enable_mcp_tools` and `enable_mcp_tools_exec`) or cli commands (`/mcpt_switch` and `/mcpt_exec_switch`).

### RAG

you can add rag context manually via `/rag_vect_add` or add an entire text file via `/rag_import_file` . You can add rag context manually via `/rag_vect_add` or add an entire text file via `/rag_import_file`.

you can list the current rag memory db via the `/rag_vect_list`

you can submit your query to the model via the `/rag_lookup` command otherwise it will submit your query without the rag.

remember to check your rag model (`/info`) and you can change model via `/newragmodel` .

### examples

```
/* enable mcptools */
>>> /mcpt_switch

/* list mcp tools */
>>> /mcptools
demo__addition : addition of two numbers.
  - props: {"num1":{"description":"Number1","type":"STRING"},"num2":{"description":"Number2","type":"STRING"}}
  - required: ["num1","num2"]

/* enable mcp tools execution */
>>> /mcpt_exec_switch

/* direct mcp tool call */
>>> /mcpt_call demo__addition {num1: 2, num2:4}
 tool call ... demo addition { num1: 2, num2: 4 }

 sum of two numbers is 6

/* the model will call the tool if needed */
>>> 2+3
[ llm ]:
{"name":"demo__addition","args":{"num2":"3","num1":"2"}}
 tool call ... demo addition { num2: '3', num1: '2' }

 sum of two numbers is 5

/* manually add rags ... */
>>> /rag_vect_add my ferrari is red and goes very fast. more fast than the black lamborghini.
>>> /rag_vect_add the sun is light and yellow.
>>> /rag_vect_add the sea is blue.

/* list rag in-memory-DB */
>>> /rag_vect_list
1 : my ferrari is red and goes very fast. more fast than the black lamborghini. [ 3072 values ]
2 : the sun is light and yellow. [ 3072 values ]
3 : the sea is blue. [ 3072 values ]

/* query the llm model with rag context */
>>> /rag_lookup what color is my ferrari ??
[ llm ]:
Based on the context, your Ferrari is **red**.

```

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

