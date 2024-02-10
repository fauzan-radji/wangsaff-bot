import { fileTypeFromBuffer } from "file-type";
import instagramDl from "@sasmeee/igdl";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;

export async function instagram(url) {
  const response = await instagramDl(url);
  const medias = [];

  for (const res of response) {
    const downloadLink = res.download_link;
    const media = await download(downloadLink, "ig_");
    medias.push(media);
  }

  return medias;
}

export async function download(url, prefix = "") {
  const buffer = await fetch(url).then((res) => res.arrayBuffer());
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const filename = `${prefix}${Date.now()}.${ext}`;
  const media = new MessageMedia(mime, toBase64(buffer), filename);
  return {
    media,
    filename,
    mime,
  };
}

function toBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
