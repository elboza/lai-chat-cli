import fs from 'fs';
import { get_base_dir } from '#root/src/defaults.js';

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

export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
