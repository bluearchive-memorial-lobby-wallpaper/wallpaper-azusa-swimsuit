import { createServer } from "vite";

export async function loadWallpaperConfig(root) {
  const server = await createServer({
    root,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });
  try {
    const config = await server.ssrLoadModule("/src/config.ts");
    return {
      config,
      close: async () => {
        await server.close();
      },
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}
