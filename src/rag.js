import fs from 'fs';

const CONTEXT_LEN = 10;
const CLOSEST_NUM = 5;
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

export const rag_ctx_addclosest = () => {
  let cl_list = [];
  rag_ctx_db.forEach(item => {
    const target_index = rag_db.findIndex(x => item.id === x.id);
    const start = Math.max(0, target_index - CLOSEST_NUM);
    const end = Math.min(rag_db.length, target_index + 1 + CLOSEST_NUM);
    const result = rag_db.slice(start, end).map(x => ({ id: x.id, text: x.text }));
    cl_list.push(result);
  });
  cl_list = cl_list.flat();

  cl_list = Array.from(new Map([...cl_list, ...rag_ctx_db].map(item => [item.id, item])).values());

  console.log('zz1 ...closest resukts ... ', cl_list);
};

export const rag_ctx_free = () => {
  rag_ctx_db = [];
};
