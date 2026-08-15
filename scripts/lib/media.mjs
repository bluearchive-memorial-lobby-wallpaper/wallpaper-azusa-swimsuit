import { createHash } from "node:crypto";
import path from "node:path";

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function pngDimensions(bytes, source) {
  if (bytes.subarray(1, 4).toString("ascii") !== "PNG") {
    throw new Error(`Invalid PNG file: ${source}`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

export function gifMetadata(bytes, source) {
  const signature = bytes.subarray(0, 6).toString("ascii");
  if (signature !== "GIF87a" && signature !== "GIF89a") {
    throw new Error(`Invalid GIF file: ${source}`);
  }

  const width = bytes.readUInt16LE(6);
  const height = bytes.readUInt16LE(8);
  const packed = bytes[10];
  let offset = 13 + ((packed & 0x80) ? 3 * (2 ** ((packed & 0x07) + 1)) : 0);
  let frames = 0;

  const skipSubBlocks = () => {
    while (offset < bytes.length) {
      const length = bytes[offset];
      offset += 1;
      if (length === 0) return;
      offset += length;
    }
    throw new Error(`Truncated GIF data: ${source}`);
  };

  while (offset < bytes.length) {
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0x3b) break;
    if (marker === 0x21) {
      offset += 1;
      skipSubBlocks();
      continue;
    }
    if (marker !== 0x2c || offset + 9 > bytes.length) {
      throw new Error(`Invalid GIF block: ${source}`);
    }
    frames += 1;
    const imagePacked = bytes[offset + 8];
    offset += 9;
    if (imagePacked & 0x80) offset += 3 * (2 ** ((imagePacked & 0x07) + 1));
    offset += 1;
    skipSubBlocks();
  }

  return { width, height, frames };
}

export function parseChecksumManifest(text, source) {
  const checksums = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = /^([a-f0-9]{64})\s{2}(.+)$/.exec(line);
    if (!match) throw new Error(`Invalid checksum line in ${source}: ${line}`);
    checksums.set(match[2].replaceAll("/", path.sep), match[1]);
  }
  return checksums;
}

export function atlasPages(atlasText, source) {
  const pages = [];
  for (const line of atlasText.split(/\r?\n/)) {
    const name = line.trim();
    if (/\.png$/i.test(name)) pages.push(name);
  }
  if (pages.length === 0) {
    throw new Error(`Atlas does not reference any PNG pages: ${source}`);
  }
  return pages;
}
