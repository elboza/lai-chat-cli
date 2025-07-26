let chat_messages = [];
const MAX_LEN = -1;

export const add_message = message => {
  chat_messages.push(message);
  if (MAX_LEN > 0) {
    forget_message_top();
  }
};

export const get_messages = () => chat_messages;

const forget_message_top = () => {
  chat_messages.shift();
};

export const reset_messages = () => {
  chat_messages = [];
};

export const refresh_chat = options => {
  for (const msg of get_messages()) {
    if (msg.role === 'system') {
      continue;
    }
    if (msg.role === 'user') {
      console.log(`>>> ${msg.content}`);
    }
    if (msg.role === 'assistant') {
      if (options?.show_model_name) {
        console.log(`[ ]:`);
      }
      console.log(msg.content);
    }
  }
};
