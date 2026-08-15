import assert from "node:assert/strict";
import path from "node:path";
import {
  calculateViewportLayout,
  createModelRotationMatrix,
  rotateModelPoint,
} from "ba-memorial-lobby-wallpaper-runtime";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";

const root = path.resolve(import.meta.dirname, "..");
const { config, close } = await loadWallpaperConfig(root);
try {
  const { MODEL } = config;
  const cases = [
    ["1080p 16:9", 1920, 1080, 1920, 1080],
    ["1440p 16:9", 2560, 1440, 1920, 1080],
    ["2160p 16:9", 3840, 2160, 1920, 1080],
    ["1200p 16:10", 1920, 1200, 1728, 1080],
    ["1600p 16:10", 2560, 1600, 1728, 1080],
    ["UWQHD 21:9", 3440, 1440, 2580, 1080],
    ["DQHD 32:9", 5120, 1440, 3840, 1080],
    ["XGA 4:3", 1024, 768, 1440, 1080],
  ];

  for (const [name, cssWidth, cssHeight, renderWidth, renderHeight] of cases) {
    const layout = calculateViewportLayout({
      cssWidth,
      cssHeight,
      requestedHeight: 1080,
      maximumWidth: 32768,
      maximumHeight: 32768,
      modelScale: 0.8,
      modelX: 0,
      modelY: 0,
      designViewport: MODEL.designViewport,
    });
    assert.equal(layout.pixelWidth, renderWidth, `${name} render width`);
    assert.equal(layout.pixelHeight, renderHeight, `${name} render height`);
    assert.ok(
      Math.abs(layout.worldRect.left + layout.worldRect.width / 2) < 0.001,
      `${name} horizontal center`,
    );
    assert.ok(
      Math.abs(
        layout.worldRect.bottom +
          layout.worldRect.height / 2 -
          MODEL.designViewport.centerY,
      ) < 0.001,
      `${name} vertical center`,
    );
    assert.ok(
      Math.abs(
        layout.worldRect.width / layout.worldRect.height -
          cssWidth / cssHeight,
      ) < 0.001,
      `${name} aspect ratio`,
    );
  }

  const pivot = { x: 10, y: 20 };
  const rotated = rotateModelPoint({ x: 15, y: 20 }, 90, pivot);
  assert.ok(Math.abs(rotated.x - 10) < 0.0001);
  assert.ok(Math.abs(rotated.y - 25) < 0.0001);
  const matrix = createModelRotationMatrix(90, pivot);
  const matrixX = matrix[0] * 15 + matrix[4] * 20 + matrix[12];
  const matrixY = matrix[1] * 15 + matrix[5] * 20 + matrix[13];
  assert.ok(Math.abs(matrixX - rotated.x) < 0.0001);
  assert.ok(Math.abs(matrixY - rotated.y) < 0.0001);

  console.log(
    "Validated composition math and center-pivot model rotation across 4:3, 16:9, 16:10, 21:9, and 32:9 displays.",
  );
} finally {
  await close();
}
