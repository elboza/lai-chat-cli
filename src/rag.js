export let rag_db = [];

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
