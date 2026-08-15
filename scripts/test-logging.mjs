import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { createServer as createViteServer } from "vite";

const sessionFile = "2026-08-15_00-00-00-000_tpl001.log";
const output = path.resolve("dist", "log", sessionFile);
const vite = await createViteServer({
  logLevel: "silent",
  server: { middlewareMode: true },
});
const server = createHttpServer(vite.middlewares);

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  const endpoint = `http://127.0.0.1:${address.port}/__wallpaper-log/append`;

  const malformedResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not-json",
  });
  assert.equal(malformedResponse.status, 400);
  assert.equal(await malformedResponse.text(), "Invalid JSON payload");

  const oversizedResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "x".repeat(1024 * 1024 + 1),
  });
  assert.equal(oversizedResponse.status, 413);
  assert.equal(await oversizedResponse.text(), "Log payload too large");

  const invalidResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionFile: "../outside.log", lines: ["blocked"] }),
  });
  assert.equal(invalidResponse.status, 400);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionFile,
      lines: ["first log line", "second log line"],
    }),
  });
  assert.equal(response.status, 204);
  assert.equal(
    await readFile(output, "utf8"),
    "first log line\nsecond log line\n",
  );
  console.log("Validated the local development log bridge and dist/log mirror.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await vite.close();
  await unlink(output).catch(() => undefined);
}
