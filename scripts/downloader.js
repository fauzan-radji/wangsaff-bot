import http from "http";
import https from "https";
import fs from "fs";
import pkg from "btch-downloader";
import { media } from "./path.js";
import { data } from "./utils.js";
const { igdl } = pkg;

export function instagram(url) {
  return igdl(url);
}

export async function download(url, fileExtention) {
  const proto = !url.charAt(4).localeCompare("s") ? https : http;

  return new Promise((resolve, reject) => {
    const request = proto.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      const filename = `${Date.now()}.${fileExtention}`;
      const file = fs.createWriteStream(media(filename));
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        const files = data("media");
        files.push({
          url,
          filetype: fileExtention,
          date: new Date().toLocaleString(),
          filename,
        });
        data("media", files);
        resolve(filename);
      });

      file.on("error", (err) => {
        fs.unlink(media(filename));
        reject(err.message);
      });

      request.on("error", (err) => {
        fs.unlink(media(filename));
        reject(err.message);
      });
    });
    request.end();
  });
}
