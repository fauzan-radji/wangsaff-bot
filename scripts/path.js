import path from "path";
import { existsSync, lstatSync } from "fs";

function absolute(relative) {
  return path.resolve(relative);
}

export function root(child = "") {
  return `${absolute("./")}/${child.trimStart("/")}`;
}

export function data(child = "") {
  return `${root("data")}/${child.trimStart("/")}`;
}

export function fileExists(path) {
  return existsSync(path) && lstatSync(path).isFile();
}

export function dirExists(path) {
  return existsSync(path) && lstatSync(path).isDirectory();
}

export const LOG_FILE = root("logs.txt");

export const CHROME = "/usr/bin/google-chrome-stable";
export default { root, data, fileExists, dirExists, LOG_FILE, CHROME };
