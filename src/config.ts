import {
  assertWallpaperDefinition,
  createDialogueLineResolver,
  defineWallpaper,
} from "ba-memorial-lobby-wallpaper-runtime";

export type VoiceLocale = "ja" | "zh-cn" | "ko";
export type SubtitleLocale = "zh-cn" | "ja" | "ko" | "en";

// ---------------------------------------------------------------------------
// Project identity.
// ---------------------------------------------------------------------------
export const PROJECT = {
  id: "blue-archive-azusa-swimsuit",
  slug: "azusa-swimsuit",
  title: "白洲梓（泳装）",
  editionLabel: "OFFLINE EDITION · 0.1.0",
} as const;

export const VOICE_LOCALES: readonly VoiceLocale[] = ["ja", "zh-cn", "ko"];
export const SUBTITLE_LOCALES: readonly SubtitleLocale[] = [
  "zh-cn",
  "ja",
  "ko",
  "en",
];

export const BGM = {
  title: "Luminous memory",
  path: `./assets/${PROJECT.slug}/bgm/02 - Luminous Memory.flac`,
} as const;

export interface DialogueLine {
  id: string;
  text: Record<SubtitleLocale, string>;
}

export interface DialogueDefinition {
  index: number;
  motionAnimation: string;
  attachmentAnimation: string;
  duration: number;
  lines: readonly [DialogueLine, DialogueLine];
}

export const MODEL = {
  binary: `./assets/${PROJECT.slug}/model/Azusa_swimsuit_home.skel`,
  atlases: {
    "2k": `./assets/${PROJECT.slug}/model/Azusa_swimsuit_home.atlas`,
    "4k": `./assets/${PROJECT.slug}/model-4k/Azusa_swimsuit_home.atlas`,
    "8k": `./assets/${PROJECT.slug}/model-8k/Azusa_swimsuit_home.atlas`,
  },
  spineVersion: "3.8.96",
  introAnimation: "Start_Idle_01",
  idleAnimation: "Idle_01",
  designViewport: {
    width: 2560,
    height: 1600,
    centerX: 0,
    centerY: 900,
  },
  tracks: {
    base: 0,
    motion: 1,
    attachment: 2,
  },
  interaction: {
    eyeBone: "Touch_Eye",
    headControlBone: "Touch_Point",
    headAnchorBone: "Touch_Point_Key",
    lookAnimation: "Look_01_M",
    lookEndMotionAnimation: "LookEnd_01_M",
    lookEndAttachmentAnimation: "LookEnd_01_A",
    patMotionAnimation: "Pat_01_M",
    patAttachmentAnimation: "Pat_01_A",
    patEndMotionAnimation: "PatEnd_01_M",
    patEndAttachmentAnimation: "PatEnd_01_A",
    headRadius: { x: 270, y: 230 },
    bodyFromHead: { x: -70, y: -610, radiusX: 620, radiusY: 900 },
    eyeClamp: { x: 112.5, y: 200 },
    patClamp: 34,
    dragThresholdPixels: 9,
    cooldownSeconds: 0.55,
    dialogueGraceSeconds: 0.75,
  },
} as const;

// 台词文本来源：日文/简中取自 kivo.wiki（StuArchive 固定快照 student-228），
// 韩文/英文/繁中取自全局服 CharacterDialogExcel（固定提交 4ba8bd56）。
export const DIALOGUES: readonly DialogueDefinition[] = [
  {
    index: 1,
    motionAnimation: "Talk_01_M",
    attachmentAnimation: "Talk_01_A",
    duration: 13.45,
    lines: [
      {
        id: "AzusaSwimsuit_MemorialLobby_1_1",
        text: {
          "zh-cn": "哇……",
          ja: "わぁ……！",
          ko: "와……",
          en: "Wow...",
        },
      },
      {
        id: "AzusaSwimsuit_MemorialLobby_1_2",
        text: {
          "zh-cn": "我还是第一次看到，眼前的一切都闪闪发光……好漂亮……",
          ja: "こんなの初めて……目に映る全部がキラキラして、すごい……",
          ko: "이런 건 처음이야…… 눈에 비치는 게 전부 반짝반짝…… 굉장해……",
          en: "I've never seen so many shining and beautiful things at once before... It's amazing!",
        },
      },
    ],
  },
  {
    index: 2,
    motionAnimation: "Talk_02_M",
    attachmentAnimation: "Talk_02_A",
    duration: 16.5,
    lines: [
      {
        id: "AzusaSwimsuit_MemorialLobby_2_1",
        text: {
          "zh-cn": "现在竟然可以不受任何干扰，把一切美景尽收眼底……",
          ja: "何にも邪魔されずに、こうして何もかもを見渡せる場所があったなんて……。",
          ko: "이렇게 방해받지 않고, 전부 내다볼 수 있는 장소가 있었다니…….",
          en: "I can see everything in just a glance here. Nothing is in the way.",
        },
      },
      {
        id: "AzusaSwimsuit_MemorialLobby_2_2",
        text: {
          "zh-cn": "好神奇……",
          ja: "何だか、不思議な感覚……",
          ko: "뭔가……. 신기한 느낌……",
          en: "I've...never felt this way before.",
        },
      },
    ],
  },
  {
    index: 3,
    motionAnimation: "Talk_03_M",
    attachmentAnimation: "Talk_03_A",
    duration: 15.1,
    lines: [
      {
        id: "AzusaSwimsuit_MemorialLobby_3_1",
        text: {
          "zh-cn": "其实，我不怎么喜欢这种地方，太开阔了。",
          ja: "元々、こういう開けた場所はあまり好きじゃなかった。",
          ko: "사실 이렇게 탁 트인 위치는 별로 좋아하지 않았어.",
          en: "Typically, I wouldn't like such an exposed location.",
        },
      },
      {
        id: "AzusaSwimsuit_MemorialLobby_3_2",
        text: {
          "zh-cn": "没有地方可以藏身……想对四周保持警戒也很困难……",
          ja: "隠れる場所も無いし、周囲の警戒も大変で……",
          ko: "숨을 곳도 없고…… 주변 경계도 힘들고…….",
          en: "There's nowhere to take cover and securing the perimeter is difficult.",
        },
      },
    ],
  },
  {
    index: 4,
    motionAnimation: "Talk_04_M",
    attachmentAnimation: "Talk_04_A",
    duration: 12.05,
    lines: [
      {
        id: "AzusaSwimsuit_MemorialLobby_4_1",
        text: {
          "zh-cn": "不过现在……我一点都不紧张。",
          ja: "でも今は……全然不安じゃない。",
          ko: "그치만 지금은……. 불안하지 않아.",
          en: "Yet, interestingly, I'm not very concerned.",
        },
      },
      {
        id: "AzusaSwimsuit_MemorialLobby_4_2",
        text: {
          "zh-cn": "我想，这一定是因为……嗯……",
          ja: "きっとこれは、うん……",
          ko: "분명, 이건……. 응…….",
          en: "So maybe...this is... Right.",
        },
      },
    ],
  },
  {
    index: 5,
    motionAnimation: "Talk_05_M",
    attachmentAnimation: "Talk_05_A",
    duration: 13.4,
    lines: [
      {
        id: "AzusaSwimsuit_MemorialLobby_5_1",
        text: {
          "zh-cn": "现在……在我的视野中，能一直看到……",
          ja: "今の私の視界には、いつもこうやって……",
          ko: "지금의 내 시야에는, 항상 이렇게…….",
          en: "Because right now...",
        },
      },
      {
        id: "AzusaSwimsuit_MemorialLobby_5_2",
        text: {
          "zh-cn": "……老师的身影吧。",
          ja: "……先生が、いてくれるからかな。",
          ko: "……선생님이 보이고 있으니까.",
          en: "...I have Sensei in my sights.",
        },
      },
    ],
  },
] as const;

// 语音说明：kivo.wiki 目前只托管了 Azusa 泳装记忆大厅的日语语音。
// 验证构建阶段三个语音语言均指向日语音频；取得简中/韩语语音后，
// 用对应音频替换 local-assets/original/audio/<locale>/ 下的文件即可。
export function voicePath(eventId: string, locale: VoiceLocale): string {
  return `./assets/${PROJECT.slug}/audio/${locale}/${eventId.toLowerCase()}.ogg`;
}

export const WALLPAPER_DEFINITION = defineWallpaper({
  schemaVersion: 1,
  id: PROJECT.id,
  model: {
    binary: MODEL.binary,
    atlases: MODEL.atlases,
    spineVersion: MODEL.spineVersion,
    designViewport: MODEL.designViewport,
  },
  animations: {
    intro: MODEL.introAnimation,
    idle: MODEL.idleAnimation,
    tracks: MODEL.tracks,
  },
  interactions: {
    eyeBone: MODEL.interaction.eyeBone,
    headControlBone: MODEL.interaction.headControlBone,
    headAnchorBone: MODEL.interaction.headAnchorBone,
    look: {
      animation: MODEL.interaction.lookAnimation,
      endMotionAnimation: MODEL.interaction.lookEndMotionAnimation,
      endAttachmentAnimation: MODEL.interaction.lookEndAttachmentAnimation,
    },
    pat: {
      motionAnimation: MODEL.interaction.patMotionAnimation,
      attachmentAnimation: MODEL.interaction.patAttachmentAnimation,
      endMotionAnimation: MODEL.interaction.patEndMotionAnimation,
      endAttachmentAnimation: MODEL.interaction.patEndAttachmentAnimation,
    },
    headRadius: MODEL.interaction.headRadius,
    bodyFromHead: MODEL.interaction.bodyFromHead,
    eyeClamp: MODEL.interaction.eyeClamp,
    patClamp: MODEL.interaction.patClamp,
    dragThresholdPixels: MODEL.interaction.dragThresholdPixels,
    cooldownSeconds: MODEL.interaction.cooldownSeconds,
    dialogueGraceSeconds: MODEL.interaction.dialogueGraceSeconds,
  },
  dialogues: DIALOGUES.map((dialogue) => ({
    index: dialogue.index,
    motionAnimation: dialogue.motionAnimation,
    attachmentAnimation: dialogue.attachmentAnimation,
    durationSeconds: dialogue.duration,
    lines: dialogue.lines,
  })),
  audio: {
    bgm: BGM,
    voicePath,
  },
});

assertWallpaperDefinition(WALLPAPER_DEFINITION);

export const findDialogueLine = createDialogueLineResolver(
  WALLPAPER_DEFINITION.dialogues,
);
