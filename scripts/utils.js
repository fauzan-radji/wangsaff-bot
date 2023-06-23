import { readFileSync } from "fs";
import { root } from "./path.js";

export function env(key, default_ = null) {
  console.log(root(".env"));
  const content = readFileSync(root(".env"), "utf-8");
  const lines = content.split(/\n/g);
  for (const line of lines) {
    const [k, v] = line.split("=");
    if (k === key) return v;
  }

  return default_;
}
