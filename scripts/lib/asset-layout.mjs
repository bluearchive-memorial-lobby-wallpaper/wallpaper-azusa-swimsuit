import path from "node:path";

export const TIER_SCALES = { "4k": 2, "8k": 4 };

export function assetLayout(config) {
  const { PROJECT, WALLPAPER_DEFINITION: definition, VOICE_LOCALES, DIALOGUES } = config;
  const binary = definition.model.binary;
  const binaryBase = path.posix.basename(binary).replace(/\.(skel|json)$/, "");
  const binaryDir = path.posix.dirname(binary);
  const atlases = Object.entries(definition.model.atlases);
  const baseTierEntry = atlases.find(
    ([, atlasPath]) => path.posix.dirname(atlasPath) === binaryDir,
  );
  if (!baseTierEntry) {
    throw new Error(
      "config.model.atlases must include one tier whose path shares the model.binary directory",
    );
  }
  const [baseTier, baseAtlasPath] = baseTierEntry;
  const tierFolders = new Map(
    atlases.map(([tier, atlasPath]) => [
      tier,
      path.posix.dirname(atlasPath).split("/").pop(),
    ]),
  );
  const voice = [];
  for (const locale of VOICE_LOCALES) {
    for (const dialogue of DIALOGUES) {
      for (const line of dialogue.lines) {
        const id = line.id.toLowerCase();
        voice.push({ locale, id, relative: `audio/${locale}/${id}.ogg` });
      }
    }
  }
  const bgmFile = definition.audio?.bgm
    ? path.posix.basename(definition.audio.bgm.path)
    : null;
  return {
    slug: PROJECT.slug,
    binaryBase,
    baseTier,
    baseAtlasPath,
    tierFolders,
    voice,
    bgmFile,
    bgm: definition.audio?.bgm ?? null,
    dialogueCount: DIALOGUES.length,
  };
}

export function scaleAtlas(atlasText, scale) {
  return atlasText.replace(
    /^(\s*)(size|xy|orig|offset):\s*(\d+),\s*(\d+)\s*$/gm,
    (_, indent, key, first, second) =>
      `${indent}${key}: ${Number(first) * scale}, ${Number(second) * scale}`,
  );
}
