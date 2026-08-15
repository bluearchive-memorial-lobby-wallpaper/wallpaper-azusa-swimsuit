import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "ba-memorial-lobby-wallpaper-runtime";

export function projectDefaultsFromProperties(properties) {
  return {
    modelScale: properties.modelscale.value,
    modelX: properties.modelx.value,
    modelY: properties.modely.value,
    modelRotation: properties.modelrotation.value,
    positionPreset: properties.positionpreset.value,
    panelPositionPreset: properties.panelpositionpreset.value,
    panelScale: properties.panelscale.value,
    panelX: properties.panelx.value,
    panelY: properties.panely.value,
    interactionPreset: properties.interactionpreset.value,
    dialogueLanguagePreset: properties.dialoguelanguagepreset.value,
    muted: properties.muted.value,
    dialogueAutoPlay: properties.dialogueautoplay.value,
    subtitlesEnabled: properties.showsubtitles.value,
    primarySubtitleLocale: properties.subtitlelanguage.value,
    secondarySubtitlesEnabled: properties.showsecondarysubtitles.value,
    secondarySubtitleLocale: properties.secondarysubtitlelanguage.value,
    subtitleAlignment: properties.subtitlealignment.value,
    subtitlePosition: properties.subtitleposition.value,
    subtitleX: properties.subtitlex.value,
    subtitleY: properties.subtitley.value,
    debugPreset: properties.debugpreset.value,
    bgmVolume: properties.bgmvolume.value / 100,
    voiceVolume: properties.voicevolume.value / 100,
    qualityPreset: properties.qualitypreset.value,
    renderResolution: properties.renderresolution.value,
    modelResolution: properties.modelresolution.value,
    fpsLimit: properties.fpslimit.value,
  };
}

export function checkProjectDefaults(properties) {
  const projectDefaults = projectDefaultsFromProperties(properties);
  const runtimeDefaults = Object.fromEntries(
    Object.keys(projectDefaults).map((key) => [key, DEFAULT_SETTINGS[key]]),
  );
  assert.deepEqual(projectDefaults, runtimeDefaults);
}
