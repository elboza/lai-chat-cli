import fs from 'fs';

const CONTEXT_LEN = 10;
export let rag_db = [];
let rag_ctx_db = [];

let id = 0;

export const rag_add = (text, values) => {
  id++;
  rag_db.push({ id, text, values });
};

export const rag_rm = idx => {
  rag_db = rag_db.filter(x => `${x.id}` !== idx);
};

export const rag_list = () => {
  rag_db.forEach(x => {
    console.log(`${x.id} : ${x.text} [ ${x.values.length} values ]`);
  });
};

export const rag_free = () => {
  rag_db = [];
  id = 0;
};

export const rag_search = text => {
  rag_db
    .filter(x => x.text.includes(text))
    .forEach(x => {
      console.log(`${x.id} : ${x.text} [ ${x.values.length} values ]`);
    });
};
const read_file_as_string = filename => {
  let fileContents;
  try {
    fileContents = fs.readFileSync(filename).toString();
    return fileContents;
  } catch (e) {
    console.log('error opening rag file ...', e);
    return null;
  }
};

const import_text_data = data =>
  data
    .split('\n')
    .map(x => x.split('.'))
    .flat()
    .filter(x => !!x);

const import_json_data = data => {
  try {
    if (data) {
      const parsed_data = JSON.parse(data);
      if (typeof parsed_data === 'string') {
        return [parsed_data];
      }
      if (parsed_data instanceof Array) {
        return parsed_data
          .map(x => (typeof x === 'string' ? x : JSON.stringify(x)))
          .flat()
          .filter(x => !!x);
      }
      if (parsed_data) {
        return JSON.stringify([parsed_data]);
      }
    }
    return null;
  } catch (e) {
    // console.log('error reading config file ...', e);
    return null;
  }
};
export const rag_import_file = filename => {
  const data = read_file_as_string(filename);
  let rag_file_list;
  if (data) {
    rag_file_list = import_json_data(data);
    if (!rag_file_list) {
      rag_file_list = import_text_data(data);
    }
    return rag_file_list;
  }
};

export const rag_ctx_add = item => {
  if (item.id && item.text && item.sim_val) {
    rag_ctx_db.push(item);
    rag_ctx_db.sort((a, b) => {
      if (a.sim_val < b.sim_val) {
        return 1;
      }
      if (a.sim_val > b.sim_val) {
        return -1;
      }
      return 0;
    });
    if (rag_ctx_db.length > CONTEXT_LEN) {
      rag_ctx_db.pop();
    }
  }
};

export const rag_ctx_list = () => rag_ctx_db;

export const rag_ctx_free = () => {
  rag_ctx_db = [];
};
