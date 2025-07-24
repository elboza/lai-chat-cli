import fs from 'fs';
import { get_base_dir} from '#root/defaults.js';

const CONFIG_FILE = 'lai_config.json';

// eslint-disable-next-line import/prefer-default-export
export const read_config = () => {
  let fileContents;
  try {
    fileContents = fs.readFileSync(`${get_base_dir()}/${CONFIG_FILE}`).toString();
  } catch (e) {
    // console.log('error opening config file ...', e);
    return {};
  }
  try {
    if (fileContents) {
      return JSON.parse(fileContents);
    }
    return {};
  } catch (e) {
    console.log('error reading config file ...', e);
    return {};
  }
};
