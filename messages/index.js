import fs from "fs";
import path from "../scripts/path.js";

// load all contents of the messages folder in respective objects with the filename as key
const files = fs
  .readdirSync(path.message())
  .filter((file) => file.endsWith(".txt"));

const fileContents = Object.fromEntries(
  files.map((file) => [
    file.split(".").slice(0, -1).join("."),
    fs.readFileSync(path.message(file), "utf-8"),
  ])
);

export default fileContents;
