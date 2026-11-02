import { readFileSync } from "node:fs";
import { parseManifest } from "@docleus/sdk";
import { describe, expect, it } from "vitest";
import config from "../tsdown.config.ts";
import { COUNTER_TYPE } from "../src/shared/index.ts";

const manifest = parseManifest(
  JSON.parse(
    readFileSync(new URL("../docleus.plugin.json", import.meta.url), "utf8"),
  ),
);

/** Every file the tsdown builds write for their entries, as `./dist/...` paths. */
function buildOutputs(): string[] {
  const builds: readonly unknown[] = Array.isArray(config) ? config : [config];
  return builds.flatMap((build) => {
    if (typeof build !== "object" || build === null) return [];
    const { entry, outDir = "dist" } = build as {
      entry?: unknown;
      outDir?: unknown;
    };
    if (typeof entry !== "object" || entry === null) return [];
    return Object.keys(entry).map((name) => `./${String(outDir)}/${name}.js`);
  });
}

describe("docleus.plugin.json", () => {
  it("is a valid manifest with the counter island", () => {
    expect(manifest.islands).toEqual({
      [COUNTER_TYPE]: "./dist/site/counter.js",
    });
  });

  it("points only at files the build produces", () => {
    const outputs = buildOutputs();
    const files = [
      ...Object.values(manifest.entries),
      ...Object.values(manifest.islands),
    ];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(outputs).toContain(file);
  });

  it("keeps the site entry and islands in one browser root", () => {
    const files = [manifest.entries.site, ...Object.values(manifest.islands)];
    for (const file of files) expect(file).toMatch(/^\.\/dist\/site\/[^/]+$/);
  });
});
