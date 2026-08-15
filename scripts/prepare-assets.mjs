import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assetLayout, scaleAtlas, TIER_SCALES } from "./lib/asset-layout.mjs";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";
import {
  atlasPages,
  parseChecksumManifest,
  pngDimensions,
  sha256,
} from "./lib/media.mjs";

const root = path.resolve(import.meta.dirname, "..");
const original = path.join(root, "local-assets", "original");
const generatedAssets = path.join(root, "generated-assets");
const checksumsPath = path.join(root, "research", "checksums.sha256");

async function exists(target) {
  return access(target).then(
    () => true,
    () => false,
  );
}

const { config, close } = await loadWallpaperConfig(root);
try {
  const layout = assetLayout(config);
  const publicAssets = path.join(root, "public", "assets", layout.slug);
  const checksums = parseChecksumManifest(
    await readFile(checksumsPath, "utf8"),
    "research/checksums.sha256",
  );
  if (checksums.size === 0) {
    throw new Error(
      "research/checksums.sha256 is empty. Place the originals under " +
        "local-assets/original/ and run `npm run generate:checksums` first.",
    );
  }

  const checksumKey = (relative) =>
    path.join("local-assets", "original", relative);

  async function copyVerified(relative) {
    const key = checksumKey(relative);
    const expectedHash = checksums.get(key);
    if (!expectedHash) {
      throw new Error(
        `No pinned checksum for ${key}. Run \`npm run generate:checksums\` ` +
          "after adding the file.",
      );
    }
    const source = path.join(original, relative);
    const bytes = await readFile(source);
    if (sha256(bytes) !== expectedHash) {
      throw new Error(`${key} failed SHA-256 verification`);
    }
    const target = path.join(publicAssets, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
    return bytes;
  }

  const baseAtlasText = await readFile(
    path.join(original, "model", `${layout.binaryBase}.atlas`),
    "utf8",
  );
  const pages = atlasPages(baseAtlasText, `${layout.binaryBase}.atlas`);
  for (const relative of [
    `model/${layout.binaryBase}.skel`,
    `model/${layout.binaryBase}.atlas`,
    ...pages.map((page) => `model/${page}`),
  ]) {
    await copyVerified(relative);
  }

  for (const voice of layout.voice) {
    await copyVerified(voice.relative);
  }

  if (!layout.bgmFile) throw new Error("config.audio.bgm is required");
  await copyVerified(`bgm/${layout.bgmFile}`);

  for (const [tier, atlasPath] of Object.entries(config.WALLPAPER_DEFINITION.model.atlases)) {
    if (tier === layout.baseTier) continue;
    const scale = TIER_SCALES[tier];
    if (!scale) {
      throw new Error(
        `No upscale factor configured for atlas tier "${tier}". Add it to ` +
          "TIER_SCALES in scripts/lib/asset-layout.mjs.",
      );
    }
    const folder = layout.tierFolders.get(tier);
    const atlasTarget = path.join(
      publicAssets,
      folder,
      `${layout.binaryBase}.atlas`,
    );
    await mkdir(path.dirname(atlasTarget), { recursive: true });
    await writeFile(atlasTarget, scaleAtlas(baseAtlasText, scale), "utf8");
    for (const page of pages) {
      const source = path.join(generatedAssets, `model-${tier}`, page);
      const [upscaled, originalBytes] = await Promise.all([
        readFile(source),
        readFile(path.join(original, "model", page)),
      ]);
      const dimensions = pngDimensions(upscaled, source);
      const originalDimensions = pngDimensions(originalBytes, page);
      if (
        dimensions.width !== originalDimensions.width * scale ||
        dimensions.height !== originalDimensions.height * scale ||
        dimensions.colorType !== 6
      ) {
        throw new Error(
          `${source} is not a ${scale}x RGBA upscale of ${page}: ` +
            `${dimensions.width}x${dimensions.height}, color type ${dimensions.colorType}`,
        );
      }
      const target = path.join(publicAssets, folder, page);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }
  }

  const runtimeSource = path.join(
    root,
    ".cache",
    "spine-runtimes-3.8",
    "spine-ts",
    "build",
    "spine-webgl.js",
  );
  if (!(await exists(runtimeSource))) {
    throw new Error(
      "Missing pinned Spine 3.8 runtime. Obtain the matching spine-ts build " +
        "and place it at .cache/spine-runtimes-3.8/spine-ts/build/spine-webgl.js. " +
        "See docs/ASSET-PIPELINE.md.",
    );
  }
  const vendorDirectory = path.join(root, "public", "vendor");
  await mkdir(vendorDirectory, { recursive: true });
  const runtimeBytes = await readFile(runtimeSource);
  const runtimeText = runtimeBytes
    .toString("utf8")
    .replace(/^\/\/# sourceMappingURL=.*\r?\n?/gm, "");
  await writeFile(
    path.join(vendorDirectory, "spine-webgl-3.8.js"),
    runtimeText,
    "utf8",
  );
  await copyFile(
    path.join(root, "licenses", "SPINE-RUNTIMES-LICENSE.txt"),
    path.join(vendorDirectory, "SPINE-RUNTIMES-LICENSE.txt"),
  );

  console.log(
    `Prepared verified offline assets for "${layout.slug}": model tiers, ` +
      `${layout.voice.length} voices, BGM, and the Spine 3.8 runtime.`,
  );
} finally {
  await close();
}
