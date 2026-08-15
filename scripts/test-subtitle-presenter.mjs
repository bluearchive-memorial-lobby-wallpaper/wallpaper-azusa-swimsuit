import assert from "node:assert/strict";
import path from "node:path";
import {
  applySubtitleLayout,
  isSubtitleAlignment,
  isSubtitlePosition,
  resolveSubtitlePresentation,
} from "ba-memorial-lobby-wallpaper-runtime";
import { loadWallpaperConfig } from "./lib/config-loader.mjs";

const root = path.resolve(import.meta.dirname, "..");
const { config, close } = await loadWallpaperConfig(root);
try {
  const {
    WALLPAPER_DEFINITION: definition,
    DIALOGUES,
    VOICE_LOCALES,
    SUBTITLE_LOCALES,
  } = config;
  assert.ok(definition.dialogues.length >= 1);
  assert.equal(definition.dialogues.length, DIALOGUES.length);
  assert.ok(definition.audio?.bgm, "config must define BGM");

  const lines = DIALOGUES.flatMap((dialogue) => dialogue.lines);
  const linesById = new Map(lines.map((line) => [line.id.toLowerCase(), line]));
  const resolveLine = (id) => linesById.get(id.toLowerCase());
  const firstId = lines[0].id;

  for (const line of lines) {
    assert.deepEqual(
      Object.keys(line.text).sort(),
      [...SUBTITLE_LOCALES].sort(),
      `Dialogue line ${line.id} must cover every subtitle locale`,
    );
  }
  for (const locale of VOICE_LOCALES) {
    for (const line of lines) {
      const pathForVoice = definition.audio.voicePath(line.id, locale);
      assert.ok(
        pathForVoice.startsWith("./assets/") && pathForVoice.endsWith(".ogg"),
        `voicePath for ${line.id}/${locale}`,
      );
    }
  }

  assert.equal(
    resolveSubtitlePresentation(resolveLine, firstId, false, "zh-cn", true, "ja"),
    null,
  );
  const primaryOnly = resolveSubtitlePresentation(
    resolveLine,
    firstId,
    true,
    "zh-cn",
    false,
    "ja",
  );
  assert.ok(primaryOnly?.primaryText && primaryOnly.secondaryText === null);
  const dual = resolveSubtitlePresentation(
    resolveLine,
    firstId,
    true,
    "zh-cn",
    true,
    "ja",
  );
  assert.ok(dual?.primaryText && dual.secondaryText !== null);
  const dedup = resolveSubtitlePresentation(
    resolveLine,
    firstId,
    true,
    "ja",
    true,
    "ja",
  );
  assert.equal(dedup?.secondaryText, null);
  assert.equal(
    resolveSubtitlePresentation(resolveLine, "missing-event", true, "zh-cn", true, "ja"),
    null,
  );

  const properties = new Map();
  const element = {
    dataset: {},
    style: { setProperty: (key, value) => properties.set(key, value) },
  };
  applySubtitleLayout(element, {
    subtitleAlignment: "right",
    subtitlePosition: "custom",
    subtitleX: 1000,
    subtitleY: -1000,
  });
  assert.deepEqual(element.dataset, {
    alignment: "right",
    position: "custom",
  });
  assert.equal(properties.get("--subtitle-x"), "1000px");
  assert.equal(properties.get("--subtitle-y"), "-1000px");
  assert.equal(isSubtitleAlignment("left"), true);
  assert.equal(isSubtitleAlignment("invalid"), false);
  assert.equal(isSubtitlePosition("bottom-left"), true);
  assert.equal(isSubtitlePosition("invalid"), false);

  console.log(
    "Validated dialogue locale coverage, subtitle presentation states, and layout presets.",
  );
} finally {
  await close();
}
