import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validateWallpaperDefinition } from "ba-memorial-lobby-wallpaper-runtime";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";
import { gifMetadata, parseChecksumManifest } from "./lib/media.mjs";
import { checkProjectDefaults } from "./lib/project-contract.mjs";

const root = path.resolve(import.meta.dirname, "..");

async function exists(target) {
  return access(target).then(
    () => true,
    () => false,
  );
}

async function requireFile(relative) {
  assert.ok(
    await exists(path.join(root, relative)),
    `Missing required repository file: ${relative}`,
  );
}

const requiredFiles = [
  "index.html",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "README.md",
  ".gitignore",
  "src/main.ts",
  "src/config.ts",
  "src/logging/WallpaperLogger.ts",
  "src/types/wallpaper-engine.d.ts",
  "src/vite-env.d.ts",
  "public/project.json",
  "public/OFFLINE-README.txt",
  "public/THIRD-PARTY-NOTICES.txt",
  "public/preview.gif",
  "licenses/SPINE-RUNTIMES-LICENSE.txt",
  "research/checksums.sha256",
  "docs/CREATING-A-PROJECT.md",
  "docs/STRUCTURE.md",
  "docs/ASSET-PIPELINE.md",
  "docs/UPGRADING.md",
];
for (const relative of requiredFiles) await requireFile(relative);

const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
for (const script of [
  "generate:checksums",
  "verify:checksums",
  "prepare:assets",
  "dev",
  "test",
  "typecheck",
  "validate:structure",
  "check",
  "build",
  "package:offline",
  "preview",
]) {
  assert.equal(typeof packageJson.scripts?.[script], "string", `Missing npm script: ${script}`);
}
assert.equal(
  packageJson.dependencies?.["ba-memorial-lobby-wallpaper-runtime"],
  "^0.1.0",
  "Runtime dependency version must match the template contract",
);
assert.equal(
  packageJson.devDependencies?.["ba-memorial-lobby-wallpaper-toolkit"],
  "^0.1.0",
  "Toolkit dependency version must match the template contract",
);

const project = JSON.parse(
  await readFile(path.join(root, "public", "project.json"), "utf8"),
);
checkProjectDefaults(project.general.properties);
assert.equal(project.type, "web");
assert.equal(project.file, "index.html");
assert.equal(project.version, 2);
assert.equal(project.preview, "preview.gif");
assert.equal(project.visibility, "public");
assert.equal(project.contentrating, "Everyone");
assert.equal(project.ratingsex, "none");
assert.equal(project.ratingviolence, "none");
assert.ok(Array.isArray(project.tags) && project.tags.includes("Anime"));

const { config, close } = await loadWallpaperConfig(root);
try {
  const { WALLPAPER_DEFINITION: definition, DIALOGUES, SUBTITLE_LOCALES } = config;
  const issues = validateWallpaperDefinition(definition);
  assert.deepEqual(issues, [], `Config definition is invalid: ${JSON.stringify(issues)}`);
  assert.ok(DIALOGUES.length >= 1, "Config must define at least one dialogue group");
  assert.equal(definition.dialogues.length, DIALOGUES.length);
  for (const dialogue of DIALOGUES) {
    for (const line of dialogue.lines) {
      assert.deepEqual(
        Object.keys(line.text).sort(),
        [...SUBTITLE_LOCALES].sort(),
        `Dialogue line ${line.id} must cover every subtitle locale`,
      );
    }
  }
} finally {
  await close();
}

const html = await readFile(path.join(root, "index.html"), "utf8");
assert.ok(html.includes('<main id="app"></main>'), "index.html must mount #app");
assert.ok(html.includes('/src/main.ts"'), "index.html must load src/main.ts");
assert.ok(
  html.includes('src="./logging-bootstrap.js"'),
  "index.html must load the logging bootstrap",
);
assert.ok(
  html.includes('src="./vendor/spine-webgl-3.8.js"'),
  "index.html must load the vendored Spine runtime",
);
assert.ok(
  html.indexOf('src="./logging-bootstrap.js"') <
    html.indexOf('src="./vendor/spine-webgl-3.8.js"'),
  "Logging bootstrap must load before the Spine runtime",
);

const gitignore = await readFile(path.join(root, ".gitignore"), "utf8");
for (const entry of [
  "node_modules/",
  "dist/",
  "release/",
  ".cache/",
  "local-assets/",
  "generated-assets/",
  "public/assets/",
  "public/vendor/",
  "research/spine-inspection.json",
]) {
  assert.ok(gitignore.includes(entry), `.gitignore must ignore ${entry}`);
}

const preview = await readFile(path.join(root, "public", "preview.gif"));
const previewMetadata = gifMetadata(preview, "public/preview.gif");
assert.equal(previewMetadata.width, 256, "Preview must be 256x256");
assert.equal(previewMetadata.height, 256, "Preview must be 256x256");
assert.ok(previewMetadata.frames >= 2, "Preview must be animated");
assert.ok(preview.length <= 500_000, "Preview must stay below 500 KB");

const checksumsText = await readFile(
  path.join(root, "research", "checksums.sha256"),
  "utf8",
);
parseChecksumManifest(checksumsText, "research/checksums.sha256");

const readme = await readFile(path.join(root, "README.md"), "utf8");
for (const marker of ["Quick Start", "Placeholders", "Verification"]) {
  assert.ok(readme.includes(marker), `README.md must cover: ${marker}`);
}

console.log("Validated the template/project structure without requiring binary assets.");
