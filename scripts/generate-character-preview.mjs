// Generates a real 256x256 animated character preview GIF by rendering the
// Spine model in headless Chrome and sampling Idle_01 animation frames.
//
// Prerequisites:
// - `npm run prepare:assets` (or `npm run dev` / `npm run build`) so the model
//   is available under public/assets/<slug>/.
// - The app must be reachable at PREVIEW_APP_URL (default http://127.0.0.1:4188).
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";
import { gifMetadata } from "./lib/media.mjs";

const root = path.resolve(import.meta.dirname, "..");
const WIDTH = 256;
const HEIGHT = 256;
const FRAMES = 8;
const DELAY_CENTISECONDS = 10;
const SAMPLE_SECONDS = 5.6; // a bit short of the 6.67s Idle_01 loop
const APP_URL = process.env.PREVIEW_APP_URL ?? "http://127.0.0.1:4188/?testWeInterfaces";
const CHROME_PATH =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CDP_PORT = Number(process.env.PREVIEW_CDP_PORT ?? 9346);
const PROFILE_DIR =
  process.env.PREVIEW_PROFILE_DIR ??
  path.join(process.env.TEMP ?? ".", "azusa-preview-profile");

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function cdpRequest(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      ws.removeEventListener("message", onMessage);
      if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`));
      else resolve(message.result);
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function decodePng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (!width || !height || bitDepth !== 8) {
    throw new Error(`Unsupported PNG: ${width}x${height} depth ${bitDepth} type ${colorType}`);
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(width * height * 4);
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const recon = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? recon[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      let value = line[x];
      switch (filter) {
        case 1:
          value = (value + left) & 0xff;
          break;
        case 2:
          value = (value + up) & 0xff;
          break;
        case 3:
          value = (value + ((left + up) >> 1)) & 0xff;
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          value = (value + predictor) & 0xff;
          break;
        }
        default:
          break;
      }
      recon[x] = value;
    }
    for (let x = 0; x < width; x++) {
      const src = x * bpp;
      const dst = (y * width + x) * 4;
      if (colorType === 6) {
        out[dst] = recon[src];
        out[dst + 1] = recon[src + 1];
        out[dst + 2] = recon[src + 2];
        out[dst + 3] = recon[src + 3];
      } else if (colorType === 2) {
        out[dst] = recon[src];
        out[dst + 1] = recon[src + 1];
        out[dst + 2] = recon[src + 2];
        out[dst + 3] = 255;
      } else {
        out[dst] = recon[src];
        out[dst + 1] = recon[src];
        out[dst + 2] = recon[src];
        out[dst + 3] = 255;
      }
    }
    prev.set(recon);
  }
  return { width, height, pixels: out };
}

function lzwEncode(pixels, minCodeSize) {
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

function medianCut(pixels, maxColors) {
  // Quantize RGBA pixels into at most maxColors colors (alpha-aware box cut).
  const workingPixels = Buffer.from(pixels);
  const boxes = [{ start: 0, count: workingPixels.length / 4, pixels: workingPixels }];
  const palette = [];
  const indices = new Uint8Array(pixels.length / 4);

  const colorAt = (box, i) => {
    const idx = (box.start + i) * 4;
    return [box.pixels[idx], box.pixels[idx + 1], box.pixels[idx + 2], box.pixels[idx + 3]];
  };

  const split = (box) => {
    if (box.count < 2) return null;
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (let i = 0; i < box.count; i++) {
      const [r, g, b] = colorAt(box, i);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (g < minG) minG = g;
      if (g > maxG) maxG = g;
      if (b < minB) minB = b;
      if (b > maxB) maxB = b;
    }
    const rangeR = maxR - minR;
    const rangeG = maxG - minG;
    const rangeB = maxB - minB;
    let channel = 0;
    let range = rangeR;
    if (rangeG > range) { channel = 1; range = rangeG; }
    if (rangeB > range) { channel = 2; range = rangeB; }
    if (range === 0) return null;
    const order = Array.from({ length: box.count }, (_, i) => i).sort((a, b) => {
      const ca = colorAt(box, a);
      const cb = colorAt(box, b);
      return ca[channel] - cb[channel];
    });
    const median = box.count >> 1;
    const reordered = Buffer.alloc(box.count * 4);
    for (let i = 0; i < box.count; i++) {
      const src = (box.start + order[i]) * 4;
      reordered[i * 4] = box.pixels[src];
      reordered[i * 4 + 1] = box.pixels[src + 1];
      reordered[i * 4 + 2] = box.pixels[src + 2];
      reordered[i * 4 + 3] = box.pixels[src + 3];
    }
    reordered.copy(box.pixels, box.start * 4, 0, reordered.length);
    return [
      { start: box.start, count: median, pixels: box.pixels },
      { start: box.start + median, count: box.count - median, pixels: box.pixels },
    ];
  };

  while (boxes.length < maxColors) {
    const candidates = boxes
      .map((box, index) => ({ box, index, score: box.count > 1 ? boxRange(box) : -1 }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score);
    if (candidates.length === 0) break;
    const parts = split(candidates[0].box);
    if (!parts) break;
    boxes.splice(candidates[0].index, 1, ...parts);
  }

  function boxRange(box) {
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (let i = 0; i < box.count; i++) {
      const [r, g, b] = colorAt(box, i);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (g < minG) minG = g;
      if (g > maxG) maxG = g;
      if (b < minB) minB = b;
      if (b > maxB) maxB = b;
    }
    return Math.max(maxR - minR, maxG - minG, maxB - minB);
  }

  for (const box of boxes) {
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    for (let i = 0; i < box.count; i++) {
      const [r, g, b, a] = colorAt(box, i);
      sumR += r;
      sumG += g;
      sumB += b;
      sumA += a;
    }
    palette.push([
      Math.round(sumR / box.count),
      Math.round(sumG / box.count),
      Math.round(sumB / box.count),
      Math.round(sumA / box.count),
    ]);
  }

  for (let i = 0; i < indices.length; i++) {
    const r = pixels[i * 4], g = pixels[i * 4 + 1], b = pixels[i * 4 + 2], a = pixels[i * 4 + 3];
    let best = 0;
    let bestDistance = Infinity;
    for (let p = 0; p < palette.length; p++) {
      const dr = r - palette[p][0];
      const dg = g - palette[p][1];
      const db = b - palette[p][2];
      const da = a - palette[p][3];
      const distance = dr * dr + dg * dg + db * db + da * da;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = p;
      }
    }
    indices[i] = best;
  }
  return { palette, indices };
}

function buildGif(frames, palette) {
  const chunks = [];
  const push = (...bytes) => chunks.push(Buffer.from(bytes));
  const pushText = (text) => chunks.push(Buffer.from(text, "ascii"));
  const minCodeSize = Math.max(2, Math.ceil(Math.log2(palette.length || 1)));
  const paddedPalette = [...palette];
  while (paddedPalette.length < 1 << minCodeSize) {
    paddedPalette.push(palette[0] ?? [0, 0, 0]);
  }
  const gctSizeBits = minCodeSize - 1;

  pushText("GIF89a");
  push(WIDTH & 0xff, (WIDTH >> 8) & 0xff, HEIGHT & 0xff, (HEIGHT >> 8) & 0xff);
  // Packed fields: global color table flag, 8-bit color resolution,
  // and global color table size (bits 0-2).
  push(0x80 | (gctSizeBits << 4) | gctSizeBits, 0x00, 0x00);
  for (const [r, g, b] of paddedPalette) push(r, g, b);

  for (const indices of frames) {
    push(0x21, 0xf9, 0x04, 0x04, DELAY_CENTISECONDS & 0xff, 0x00, 0x00, 0x00);
    push(0x2c, 0, 0, 0, 0, WIDTH & 0xff, (WIDTH >> 8) & 0xff, HEIGHT & 0xff, (HEIGHT >> 8) & 0xff, 0x00);
    push(minCodeSize);
    const encoded = lzwEncode(indices, minCodeSize);
    for (let offset = 0; offset < encoded.length; offset += 255) {
      const block = encoded.subarray(offset, offset + 255);
      push(block.length, ...block);
    }
    push(0x00);
  }
  push(0x3b);
  return Buffer.concat(chunks);
}

function cropAndScale(pixels, width, height, box, outWidth, outHeight) {
  const out = Buffer.alloc(outWidth * outHeight * 4);
  for (let y = 0; y < outHeight; y++) {
    const srcY = Math.min(height - 1, Math.max(0, Math.round(box.y + (y / outHeight) * box.height)));
    for (let x = 0; x < outWidth; x++) {
      const srcX = Math.min(width - 1, Math.max(0, Math.round(box.x + (x / outWidth) * box.width)));
      const src = (srcY * width + srcX) * 4;
      const dst = (y * outWidth + x) * 4;
      out[dst] = pixels[src];
      out[dst + 1] = pixels[src + 1];
      out[dst + 2] = pixels[src + 2];
      out[dst + 3] = pixels[src + 3];
    }
  }
  return out;
}

function characterBox(geometry) {
  const head = geometry.head;
  const body = geometry.body;
  const left = Math.min(body.x - body.radiusX, head.x - head.radiusX);
  const right = Math.max(body.x + body.radiusX, head.x + head.radiusX);
  const top = Math.min(body.y - body.radiusY, head.y - head.radiusY);
  const bottom = Math.max(body.y + body.radiusY, head.y + head.radiusY);
  return { left, right, top, bottom };
}

async function main() {
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      "--window-size=1600,900",
      "--autoplay-policy=no-user-gesture-required",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let targets = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (targets.length) break;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!targets?.length) throw new Error("Failed to connect to headless Chrome");

  const page = targets.find((target) => target.type === "page") ?? targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const send = (method, params = {}) => cdpRequest(ws, ++id, method, params);
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: APP_URL });

  // Wait until the renderer is idle and the model is loaded.
  let renderer = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const snapshot = await evaluate(
      `window.__memoryLobbyWallpaperDebug?.getSnapshot().renderer ?? null`,
    );
    if (snapshot?.modelLoaded && snapshot.interactionMode === "idle") {
      renderer = snapshot;
      break;
    }
  }
  if (!renderer) throw new Error("Renderer did not reach idle with a loaded model");

  const viewport = await send("Page.getLayoutMetrics");
  const contentSize = viewport.cssContentSize;
  const viewportWidth = contentSize.width;
  const viewportHeight = contentSize.height;
  const box = characterBox(renderer.geometry);
  const geometryScale = renderer.viewport ? renderer.viewport.width / renderer.worldRect.width : 1;

  const frames = [];
  // Make sure we are in the looping idle animation before sampling frames.
  await evaluate(`(() => { window.__memoryLobbyWallpaperDebug?.skipToIdle?.(); return true; })()`);
  for (let frame = 0; frame < FRAMES; frame += 1) {
    // Let the looping idle animation advance between samples.
    await new Promise((resolve) => setTimeout(resolve, Math.round((SAMPLE_SECONDS / FRAMES) * 1000)));
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const png = decodePng(Buffer.from(shot.data, "base64"));
    // captureScreenshot returns device pixels; renderer geometry is in CSS pixels.
    const scale = png.width / viewportWidth;
    if (frame === 0) {
      console.log(
        `diagnostic: png=${png.width}x${png.height} viewport=${viewportWidth}x${viewportHeight} ` +
          `scale=${scale} box=${JSON.stringify(box)}`,
      );
    }
    const margin = 0.08;
    const cssWidth = (box.right - box.left) * (1 + margin * 2);
    const cssHeight = (box.bottom - box.top) * (1 + margin * 2);
    const crop = {
      x: Math.max(0, (box.left - (box.right - box.left) * margin) * scale),
      y: Math.max(0, (box.top - (box.bottom - box.top) * margin) * scale),
      width: Math.min(png.width, cssWidth * scale),
      height: Math.min(png.height, cssHeight * scale),
    };
    const scaled = cropAndScale(png.pixels, png.width, png.height, crop, WIDTH, HEIGHT);
    frames.push(scaled);
    if (frame === 0 || frame === 3 || frame === 7) {
      await writeFile(
        path.join(root, "generated-assets", `preview-frame-${frame}.png`),
        Buffer.from(shot.data, "base64"),
      );
    }
    console.log(`captured frame ${frame + 1}/${FRAMES}`);
  }

  // Verify frames differ from one another before committing the preview.
  const frameDistance = (a, b) => {
    let distance = 0;
    const samples = 512;
    for (let i = 0; i < samples; i += 1) {
      const pixel = (i * 4 * WIDTH * HEIGHT / samples) | 0;
      const dr = a[pixel] - b[pixel];
      const dg = a[pixel + 1] - b[pixel + 1];
      const db = a[pixel + 2] - b[pixel + 2];
      distance += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
    }
    return distance;
  };
  let maxDistance = 0;
  for (let frame = 1; frame < frames.length; frame += 1) {
    maxDistance = Math.max(maxDistance, frameDistance(frames[0], frames[frame]));
  }
  if (maxDistance < 2400) {
    throw new Error(
      `Preview frames are too similar (max sample distance ${maxDistance}). ` +
        `The crop or animation sampling is likely wrong.`,
    );
  }

  const all = Buffer.concat(frames);
  const { palette, indices: allIndices } = medianCut(all, 256);
  const frameIndices = [];
  for (let frame = 0; frame < FRAMES; frame += 1) {
    frameIndices.push(allIndices.subarray(frame * WIDTH * HEIGHT, (frame + 1) * WIDTH * HEIGHT));
  }
  const preview = buildGif(frameIndices, palette);
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
    `Wrote character preview to public/preview.gif (${preview.length} bytes, ${metadata.frames} frames).`,
  );
  chrome.kill();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
