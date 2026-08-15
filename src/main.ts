import "ba-memorial-lobby-wallpaper-runtime/style.css";
import { App, createWallpaperShell } from "ba-memorial-lobby-wallpaper-runtime";
import { findDialogueLine, PROJECT, WALLPAPER_DEFINITION } from "./config";
import { wallpaperLogger } from "./logging/WallpaperLogger";

wallpaperLogger.start();

const root = document.getElementById("app");
if (!(root instanceof HTMLElement)) throw new Error("Missing #app root element.");

createWallpaperShell(root, {
  title: PROJECT.title,
  canvasLabel: `${PROJECT.title} animated wallpaper`,
  editionLabel: PROJECT.editionLabel,
});

const app = new App(root, {
  definition: WALLPAPER_DEFINITION,
  findDialogueLine,
  logger: wallpaperLogger,
});
void app.start();
