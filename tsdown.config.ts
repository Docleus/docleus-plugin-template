import { defineConfig } from "tsdown";

const common = {
  format: "esm",
  dts: false,
  outExtensions: () => ({ js: ".js" }),
} as const;

export default defineConfig([
  {
    ...common,
    entry: {
      "shared/index": "src/shared/index.ts",
      "server/index": "src/server/index.ts",
    },
    clean: ["dist/shared", "dist/server", "dist/*.js"],
  },
  {
    // Browser builds of their own, so their chunks stay inside the browser
    // roots the host serves and publishes: `dist/editor` and `dist/site`.
    ...common,
    entry: { index: "src/editor/index.ts" },
    outDir: "dist/editor",
    platform: "browser",
    clean: true,
  },
  {
    ...common,
    entry: { index: "src/site/index.ts", counter: "src/site/counter.ts" },
    outDir: "dist/site",
    platform: "browser",
    clean: true,
  },
]);
