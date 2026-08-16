# Azusa (Swimsuit) Wallpaper

English | [简体中文](README.zh-CN.md)

A Blue Archive memorial-lobby-style web wallpaper for Wallpaper Engine. This is
the first character project created from the template repository after the
Hare (Camping) runtime decoupling. The project keeps only character-specific
content:

- `src/config.ts`: character content definition (model, animations, dialogues,
  voices, BGM).
- `local-assets/original/`: local original assets (not committed to Git);
  hashes are verified and files are copied during the build.
- `public/`: Wallpaper Engine metadata and release notes.
- `research/`: asset provenance and checksum manifests.

The shared runtime and toolchain are provided as npm dependencies:

- `ba-memorial-lobby-wallpaper-runtime`: Spine rendering, interactions,
  dialogues, audio, settings, logging, and the debug panel.
- `ba-memorial-lobby-wallpaper-toolkit`: checksum manifests, offline packaging,
  and other build tools.

## Quick Start

```powershell
npm install
npm run generate:checksums   # generate SHA-256 manifest for local-assets
npm run check                # typecheck, regression tests, structure validation
npm run generate:character-preview  # render a real animated preview GIF with headless Chrome
npm run dev                  # prepare assets and start the Vite dev server
npm run build                # prepare assets, typecheck, build, and validate dist/
npm run package:offline      # build a deterministic offline ZIP
```

## Placeholders to Replace

When a character project is created from the template, the following locations
are already replaced with this character's content; they still need to be
replaced when deriving another character:

| Location | Content |
| --- | --- |
| `PROJECT` in `src/config.ts` | project id, slug, title, version label |
| `MODEL` in `src/config.ts` | model paths, animations, bones/hit parameters, design viewport |
| `BGM` / `DIALOGUES` in `src/config.ts` | BGM file and dialogue/subtitle content |
| `public/project.json` | title, description, preview, rating, and tags |
| `public/preview.gif` | a real 256×256 animated preview image |
| `public/THIRD-PARTY-NOTICES.txt` | provenance and license records for the real assets |
| `public/OFFLINE-README.txt` | version number and installation notes |
| `research/PROVENANCE.md` | provenance and hashes for every binary asset |

## Local Development and Build

```powershell
npm install
npm run generate:checksums   # generate SHA-256 manifest for local-assets
npm run check                # typecheck, regression tests, structure validation
npm run dev                  # prepare assets and start the Vite dev server
npm run build                # prepare assets, typecheck, build, and validate dist/
npm run package:offline      # build a deterministic offline ZIP
```

See [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md) for the asset
preparation, build, and validation details.

## Release Status

The project is prepared for publishing to the Steam Workshop through the
Wallpaper Engine editor (the editor writes the `workshopid` on publish). The
`package:offline` script still produces a deterministic standalone ZIP.

## Assets

- Model: `Azusa_swimsuit_home` from a pinned Schale-Archive commit (Spine 3.8).
- Voices: Japanese, Korean, and Simplified Chinese memorial-lobby voices from
  Kivo Wiki (Japanese/Simplified Chinese are hash-named files, Korean uses
  lowercase descriptive names).
- BGM: lossless `Luminous Memory` from the OST (Vol.1, Mitsukiyo, FLAC).
- Subtitles: Japanese/Simplified Chinese from Kivo; Korean/English from the
  global-server `CharacterDialogExcel`.

See [research/PROVENANCE.md](research/PROVENANCE.md) for per-item sources,
hashes, and rights attribution.

## Copyright Notice

The Blue Archive character models, animations, artwork, voices, subtitle text,
and music in this package belong to their respective rights holders, including
NEXON Games Co., Ltd., Yostar, and other Blue Archive rightsholders. This
project and its assets are provided for informational and educational purposes
only, without any commercial intent. This project is an unofficial fan project
and is not affiliated with, sponsored by, or endorsed by those companies. The
affected assets will be removed upon request from the rights holders.

## Verification Gates

Before any functional change is deployed to a Wallpaper Engine project
directory, it must pass:

1. An end-to-end behavior test in an external Chrome instance (including
   console error checks);
2. A real Wallpaper Engine window test (pointer interaction, property
   callbacks, pause/resume).

Browser-side `?debug=1` and `?testWeInterfaces` are pre-checks only and cannot
replace a real Wallpaper Engine window test.
