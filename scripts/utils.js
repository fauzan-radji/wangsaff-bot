import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path, { fileExists } from "./path.js";

export function data(name, data) {
  const filePath = path.data(`${name}.json`);
  if (!fileExists(filePath)) {
    writeFileSync(filePath, "[]");
    return [];
  }

  if (data) {
    writeFileSync(filePath, JSON.stringify(data));
    return data;
  } else {
    const content = readFileSync(filePath, "utf-8");

    if (!content) {
      const data = [];
      writeFileSync(filePath, JSON.stringify(data));
      return data;
    }

    const data = JSON.parse(content);
    return data;
  }
}

/**
 * This function is used to log data to a file.
 * @param  {...string} data
 */
export function log(...data) {
  const date = new Date().toLocaleString();
  data = data.flatMap((d) => d.split(/\r?\n/g));
  appendFileSync(path.LOG_FILE, data.map((d) => `[${date}] ${d}\n`).join(""));
}

export default { data, log };
