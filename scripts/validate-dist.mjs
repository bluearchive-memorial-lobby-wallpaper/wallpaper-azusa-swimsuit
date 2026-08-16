import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validateDistributionFiles } from "ba-memorial-lobby-wallpaper-toolkit";
import { assetLayout, TIER_SCALES } from "./lib/asset-layout.mjs";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";
import { atlasPages, gifMetadata, pngDimensions } from "./lib/media.mjs";
import { checkProjectDefaults } from "./lib/project-contract.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

const { config, close } = await loadWallpaperConfig(root);
try {
  const { PROJECT, WALLPAPER_DEFINITION: definition } = config;
  const layout = assetLayout(config);
  const assets = (relative) => `assets/${layout.slug}/${relative}`;
  const required = [
    "index.html",
    "logging-bootstrap.js",
    "project.json",
    "preview.gif",
    "OFFLINE-README.txt",
    "THIRD-PARTY-NOTICES.txt",
    "vendor/spine-webgl-3.8.js",
    "vendor/SPINE-RUNTIMES-LICENSE.txt",
  ];

  const baseAtlasText = await readFile(
    path.join(dist, assets(`model/${layout.binaryBase}.atlas`)),
    "utf8",
  );
  const pages = atlasPages(
    baseAtlasText,
    `${layout.binaryBase}.atlas`,
  );
  required.push(assets(`model/${layout.binaryBase}.skel`));
  required.push(assets(`model/${layout.binaryBase}.atlas`));
  for (const page of pages) required.push(assets(`model/${page}`));
  for (const voice of layout.voice) required.push(assets(voice.relative));
  if (!layout.bgmFile) throw new Error("config.audio.bgm is required");
  required.push(assets(`bgm/${layout.bgmFile}`));

  for (const [tier, atlasPath] of Object.entries(definition.model.atlases)) {
    if (tier === layout.baseTier) continue;
    const folder = layout.tierFolders.get(tier);
    required.push(assets(`${folder}/${layout.binaryBase}.atlas`));
    for (const page of pages) required.push(assets(`${folder}/${page}`));
  }

  await validateDistributionFiles({ rootDirectory: dist, requiredFiles: required });

  const project = JSON.parse(
    await readFile(path.join(dist, "project.json"), "utf8"),
  );
  checkProjectDefaults(project.general.properties);
  if (project.type !== "web" || project.file !== "index.html") {
    throw new Error("project.json is not a web wallpaper with index.html entry");
  }
  if (
    project.version !== 2 ||
    !project.title?.includes(PROJECT.title) ||
    !project.description?.toLowerCase().includes("educational")
  ) {
    throw new Error("project.json does not identify the edition");
  }
  if (project.preview !== "preview.gif") {
    throw new Error("Edition preview metadata is missing");
  }
  if (
    project.contentrating !== "Everyone" ||
    project.ratingsex !== "none" ||
    project.ratingviolence !== "none" ||
    project.visibility !== "public" ||
    !Array.isArray(project.tags) ||
    !project.tags.includes("Anime")
  ) {
    throw new Error("Edition rating, visibility, or tags are incomplete");
  }

  const preview = await readFile(path.join(dist, "preview.gif"));
  const previewMetadata = gifMetadata(preview, "preview.gif");
  if (
    previewMetadata.width !== 256 ||
    previewMetadata.height !== 256 ||
    previewMetadata.frames < 2 ||
    preview.length > 500_000
  ) {
    throw new Error(
      `Preview must be an animated 256x256 GIF below 500 KB, got ` +
        `${JSON.stringify(previewMetadata)} (${preview.length} bytes)`,
    );
  }

  for (const [tier, scale] of Object.entries(TIER_SCALES)) {
    if (!Object.hasOwn(definition.model.atlases, tier)) continue;
    const folder = layout.tierFolders.get(tier);
    for (const page of pages) {
      const baseDimensions = pngDimensions(
        await readFile(path.join(dist, assets(`model/${page}`))),
        page,
      );
      const relative = assets(`${folder}/${page}`);
      const tierDimensions = pngDimensions(
        await readFile(path.join(dist, relative)),
        relative,
      );
      if (
        tierDimensions.width !== baseDimensions.width * scale ||
        tierDimensions.height !== baseDimensions.height * scale
      ) {
        throw new Error(`Unexpected ${tier} dimensions for ${page}`);
      }
    }
  }

  for (const relative of required.filter((file) => file.endsWith(".ogg"))) {
    const bytes = await readFile(path.join(dist, relative));
    if (bytes.subarray(0, 4).toString("ascii") !== "OggS") {
      throw new Error(`Invalid OGG file: ${relative}`);
    }
  }
  const bgmBytes = await readFile(path.join(dist, assets(`bgm/${layout.bgmFile}`)));
  const bgmMagic = bgmBytes.subarray(0, 4).toString("ascii");
  if (bgmMagic !== "fLaC" && bgmMagic !== "OggS") {
    throw new Error(
      "Built BGM is neither a FLAC nor an OGG file. " +
        "Prefer an OST lossless FLAC; fall back to the unpacked theme_xxx.ogg " +
        "when no lossless source is available.",
    );
  }

  const [offlineReadme, thirdPartyNotices, builtHtml, loggingBootstrap] =
    await Promise.all([
      readFile(path.join(dist, "OFFLINE-README.txt"), "utf8"),
      readFile(path.join(dist, "THIRD-PARTY-NOTICES.txt"), "utf8"),
      readFile(path.join(dist, "index.html"), "utf8"),
      readFile(path.join(dist, "logging-bootstrap.js"), "utf8"),
    ]);
  if (!offlineReadme.includes("MANIFEST.sha256")) {
    throw new Error("Installation and integrity instructions are incomplete");
  }
  if (!thirdPartyNotices.includes("Spine 3.8")) {
    throw new Error("Third-party notices must identify the Spine runtime version");
  }
  if (
    !builtHtml.includes('src="./logging-bootstrap.js"') ||
    builtHtml.indexOf('src="./logging-bootstrap.js"') >
      builtHtml.indexOf('src="./vendor/spine-webgl-3.8.js"')
  ) {
    throw new Error("Persistent logging bootstrap must load before the Spine runtime");
  }
  if (!builtHtml.includes('<main id="app"')) {
    throw new Error("Built HTML must mount the #app root");
  }
  if (
    !loggingBootstrap.includes("memorial-lobby-wallpaper-log:v1:") ||
    !loggingBootstrap.includes('window.addEventListener("error"') ||
    loggingBootstrap.includes("showDirectoryPicker")
  ) {
    throw new Error("Built persistent logging bootstrap is incomplete");
  }

  const builtFiles = await walk(dist);
  const builtText = (
    await Promise.all(
      builtFiles
        .filter((file) => /\.(html|js|css)$/.test(file))
        .map((file) => readFile(file, "utf8")),
    )
  ).join("\n");
  if (/https?:\/\//i.test(builtText)) {
    throw new Error("Built distribution must not contain remote URLs");
  }
  if (builtText.includes("sourceMappingURL")) {
    throw new Error("Built distribution must not contain source maps");
  }
  if (
    builtText.includes(".showModal(") ||
    builtText.includes("createObjectURL") ||
    builtText.includes("showDirectoryPicker")
  ) {
    throw new Error("Built distribution uses CEF-incompatible browser APIs");
  }

  console.log(
    `Validated dist: preview, metadata, notices, model tiers, ` +
      `${layout.voice.length} voices, BGM, Spine runtime, and distribution rules.`,
  );
} finally {
  await close();
}
