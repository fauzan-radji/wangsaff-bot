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

// export async function instagram(url) {
//   const response = await instagramDl(url);
//   const downloadLink = response[0].download_link;

//   const res = await fetchData(downloadLink);

//   return new MessageMedia(res.mime, res.data);
// }

async function fetchData(url, options = {}) {
  const reqOptions = Object.assign(
    { headers: { accept: "image/* video/* text/* audio/*" } },
    options
  );
  const response = await fetch(url, reqOptions);
  const mime = response.headers.get("Content-Type");
  const size = response.headers.get("Content-Length");
  const contentDisposition = response.headers.get("Content-Disposition");
  const name = contentDisposition
    ? contentDisposition.match(/((?<=filename=")(.*)(?="))/)
    : null;
  let data = "";
  if (response.buffer) {
    data = (await response.buffer()).toString("base64");
  } else {
    const bArray = new Uint8Array(await response.arrayBuffer());
    bArray.forEach((b) => {
      data += String.fromCharCode(b);
    });
    data = btoa(data);
  }

  return { data, mime, name, size };
}

export default { data, log };
