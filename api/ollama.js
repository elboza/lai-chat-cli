import ollama from 'ollama';

export const aichat = async (prompt, options) => {
  console.log(`\n<thinking ...>\n`);
  const response = await ollama.chat({
    model: options?.model || 'llama3.2',
    //		system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: false,
    //		format: "json",
  });

  // console.log(response.response.trim());
  // console.log(response.message?.tool_calls);
  console.log(options?.debug === true ? response : response?.message?.content);
  // console.log(response?.message?.content);
  console.log('');
  //  const responseObject = JSON.parse(response.response.trim());
  //  executeFunction(responseObject.functionName, responseObject.parameters);
};

export const aigen = async (prompt, options) => {
  console.log(`\n<thinking ...>\n`);
  const response = await ollama.generate({
    model: options?.model || 'llama3.2',
    //		system: systemPrompt,
    prompt,
    stream: false,
    //		format: "json",
  });

  // console.log(response.response.trim());
  console.log(options?.debug ? response : response?.response);
  console.log('');
  //  const responseObject = JSON.parse(response.response.trim());
  //  executeFunction(responseObject.functionName, responseObject.parameters);
};
