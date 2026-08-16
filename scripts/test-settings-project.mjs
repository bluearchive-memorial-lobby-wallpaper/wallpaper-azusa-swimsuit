import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { checkProjectDefaults } from "./lib/project-contract.mjs";

const root = path.resolve(import.meta.dirname, "..");
const project = JSON.parse(
  await readFile(path.join(root, "public", "project.json"), "utf8"),
);
checkProjectDefaults(project.general.properties);
assert.equal(project.type, "web");
assert.equal(project.file, "index.html");
assert.equal(project.version, 2);
assert.equal(project.preview, "preview.gif");
assert.equal(project.visibility, "public");
console.log(
  "Validated Wallpaper Engine project metadata and defaults against runtime defaults.",
);
