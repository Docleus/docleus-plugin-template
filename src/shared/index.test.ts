import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PLUGIN_NAME, parseCounterProps } from "./index.ts";

describe("plugin manifest", () => {
  it("names the same plugin as package.json", () => {
    const manifest = JSON.parse(
      readFileSync(
        new URL("../../docleus.plugin.json", import.meta.url),
        "utf8",
      ),
    ) as { name: string };
    expect(manifest.name).toBe(PLUGIN_NAME);
  });
});

describe("parseCounterProps", () => {
  it.each([0, 5, -3])("keeps the integer %j", (start) => {
    expect(parseCounterProps({ start })).toEqual({ start });
  });

  it.each([
    undefined,
    null,
    "3",
    {},
    { start: "3" },
    { start: 1.5 },
    { start: Number.NaN },
    { start: Number.POSITIVE_INFINITY },
    { start: 2 ** 60 },
  ])("starts %j at 0", (value) => {
    expect(parseCounterProps(value)).toEqual({ start: 0 });
  });
});
