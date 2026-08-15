import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gifMetadata } from "./lib/media.mjs";

const root = path.resolve(import.meta.dirname, "..");
const WIDTH = 256;
const HEIGHT = 256;
const FRAMES = 8;
const BAR_WIDTH = 24;
const DELAY_CENTISECONDS = 12;
const PALETTE = [
  [14, 78, 172],
  [255, 255, 255],
];

function lzwEncode(pixels) {
  const minCodeSize = 2;
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  const maxDictionaryEntries = 4096;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const dictionary = new Map();
  let current = null;
  const output = [];
  let buffer = 0;
  let bitCount = 0;

  const emit = (code) => {
    buffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(buffer & 0xff);
      buffer >>>= 8;
      bitCount -= 8;
    }
  };

  const reset = () => {
    dictionary.clear();
    for (let index = 0; index < clearCode; index += 1) {
      dictionary.set(String.fromCharCode(index), index);
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  };

  reset();
  emit(clearCode);

  for (const pixel of pixels) {
    const symbol = String.fromCharCode(pixel);
    const key = current === null ? symbol : `${current}${symbol}`;
    if (current !== null && dictionary.has(key)) {
      current = key;
      continue;
    }
    if (current !== null) {
      emit(dictionary.get(current));
      if (nextCode < maxDictionaryEntries) {
        dictionary.set(key, nextCode);
        nextCode += 1;
        // GIF code-size increases lag the encoder dictionary by one entry:
        // raise the bit width only after the dictionary is one entry ahead of
        // the decoder's table.
        if (nextCode === (1 << codeSize) + 1 && codeSize < 12) codeSize += 1;
      }
    }
    current = symbol;
  }

  if (current !== null) emit(dictionary.get(current));
  emit(eoiCode);
  if (bitCount > 0) output.push(buffer & 0xff);
  return Uint8Array.from(output);
}

function lzwDecode(bytes, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const dictionary = new Map();
  let bitBuffer = 0;
  let bitCount = 0;
  let offset = 0;

  const readCode = () => {
    while (bitCount < codeSize) {
      bitBuffer |= bytes[offset] << bitCount;
      offset += 1;
      bitCount += 8;
    }
    const code = bitBuffer & ((1 << codeSize) - 1);
    bitBuffer >>>= codeSize;
    bitCount -= codeSize;
    return code;
  };

  const reset = () => {
    dictionary.clear();
    for (let index = 0; index < clearCode; index += 1) {
      dictionary.set(index, [index]);
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  };

  const decoded = [];
  let previous = null;
  reset();

  let code = readCode();
  if (code !== clearCode) throw new Error("GIF LZW stream must start with the clear code");
  while (true) {
    code = readCode();
    if (code === eoiCode) break;
    if (code === clearCode) {
      reset();
      previous = null;
      continue;
    }
    let entry;
    if (dictionary.has(code)) {
      entry = dictionary.get(code);
    } else if (previous !== null) {
      entry = [...previous, previous[0]];
    } else {
      throw new Error("Invalid GIF LZW code");
    }
    decoded.push(...entry);
    if (previous !== null && nextCode < 4096) {
      dictionary.set(nextCode, [...previous, entry[0]]);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    }
    previous = entry;
  }
  return Uint8Array.from(decoded);
}

function framePixels(frame) {
  const pixels = new Uint8Array(WIDTH * HEIGHT);
  const barX = frame * 32;
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const border = x < 4 || x >= WIDTH - 4 || y < 4 || y >= HEIGHT - 4;
      const bar = x >= barX && x < barX + BAR_WIDTH;
      pixels[y * WIDTH + x] = border || bar ? 1 : 0;
    }
  }
  return pixels;
}

function buildGif() {
  const chunks = [];
  const push = (...bytes) => chunks.push(...bytes);

  push(...Buffer.from("GIF89a", "ascii"));
  push(WIDTH & 0xff, (WIDTH >> 8) & 0xff, HEIGHT & 0xff, (HEIGHT >> 8) & 0xff);
  push(0xf0, 0, 0);
  for (const [red, green, blue] of PALETTE) push(red, green, blue);

  push(
    0x21,
    0xff,
    0x0b,
    ...Buffer.from("NETSCAPE2.0", "ascii"),
    0x03,
    0x01,
    0x00,
    0x00,
    0x00,
  );

  for (let frame = 0; frame < FRAMES; frame += 1) {
    const pixels = framePixels(frame);
    const encoded = lzwEncode(pixels);
    const decoded = lzwDecode(encoded, 2);
    if (decoded.length !== pixels.length) {
      throw new Error(`Placeholder frame ${frame} failed the LZW round-trip check`);
    }
    for (let index = 0; index < pixels.length; index += 1) {
      if (decoded[index] !== pixels[index]) {
        throw new Error(`Placeholder frame ${frame} failed the LZW round-trip check`);
      }
    }

    push(0x21, 0xf9, 0x04, 0x04, DELAY_CENTISECONDS & 0xff, 0x00, 0x00, 0x00);
    push(
      0x2c,
      0x00,
      0x00,
      0x00,
      0x00,
      WIDTH & 0xff,
      (WIDTH >> 8) & 0xff,
      HEIGHT & 0xff,
      (HEIGHT >> 8) & 0xff,
      0x00,
    );
    push(0x02);
    for (let offset = 0; offset < encoded.length; offset += 255) {
      const block = encoded.subarray(offset, offset + 255);
      push(block.length, ...block);
    }
    push(0x00);
  }
  push(0x3b);
  return Buffer.from(chunks);
}

const preview = buildGif();
const metadata = gifMetadata(preview, "generated preview.gif");
if (
  metadata.width !== WIDTH ||
  metadata.height !== HEIGHT ||
  metadata.frames < 2 ||
  preview.length > 500_000
) {
  throw new Error(
    `Generated preview does not meet the 256x256 animated GIF constraints: ` +
      `${JSON.stringify(metadata)} (${preview.length} bytes)`,
  );
}

const outputPath = path.join(root, "public", "preview.gif");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, preview);
console.log(
  `Wrote placeholder preview to public/preview.gif (${preview.length} bytes, ` +
    `${metadata.frames} frames). Replace it with the real character preview before shipping.`,
);
