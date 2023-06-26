import { readFileSync, writeFileSync } from "fs";
import path, { fileExists, root } from "./path.js";

export function env(key, default_ = null) {
  const content = readFileSync(root(".env"), "utf-8");
  const lines = content.split(/\n/g);
  for (const line of lines) {
    const [k, v] = line.split("=");
    if (k === key) return v;
  }

  return default_;
}

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

export default { env, data };
