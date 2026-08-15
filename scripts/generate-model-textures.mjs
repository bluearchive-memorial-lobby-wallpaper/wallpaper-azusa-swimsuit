import { mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { assetLayout, TIER_SCALES } from "./lib/asset-layout.mjs";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";
import { atlasPages } from "./lib/media.mjs";

const root = path.resolve(import.meta.dirname, "..");
const toolDirectory = path.join(
  root,
  ".cache",
  "realcugan",
  "tool",
  "realcugan-ncnn-vulkan-20220728-windows",
);
const executable =
  process.env.REALCUGAN_PATH ??
  path.join(toolDirectory, "realcugan-ncnn-vulkan.exe");
const modelPath =
  process.env.REALCUGAN_MODEL_PATH ?? path.join(toolDirectory, "models-se");
const sourceDirectory = path.join(root, "local-assets", "original", "model");

function run(arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, arguments_, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Real-CUGAN exited with code ${code}`));
    });
  });
}

const { config, close } = await loadWallpaperConfig(root);
try {
  const layout = assetLayout(config);
  const atlasText = await readFile(
    path.join(sourceDirectory, `${layout.binaryBase}.atlas`),
    "utf8",
  );
  const pages = atlasPages(atlasText, `${layout.binaryBase}.atlas`);

  for (const [tier, scale] of Object.entries(TIER_SCALES)) {
    if (!Object.hasOwn(config.WALLPAPER_DEFINITION.model.atlases, tier)) continue;
    const outputDirectory = path.join(root, "generated-assets", `model-${tier}`);
    await mkdir(outputDirectory, { recursive: true });
    for (const page of pages) {
      await run([
        "-i",
        path.join(sourceDirectory, page),
        "-o",
        path.join(outputDirectory, page),
        "-s",
        String(scale),
        "-n",
        "-1",
        "-m",
        modelPath,
      ]);
    }
  }

  console.log(
    `Generated ${Object.keys(TIER_SCALES).filter((tier) =>
      Object.hasOwn(config.WALLPAPER_DEFINITION.model.atlases, tier),
    ).join("/")} model texture tiers with Real-CUGAN.`,
  );
} finally {
  await close();
}
