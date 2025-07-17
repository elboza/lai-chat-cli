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
