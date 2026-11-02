import type { BlockNode } from "@docleus/sdk";
import { createMarkdownRoundTrip } from "@docleus/testing";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { COUNTER_TYPE, COUNTER_VERSION } from "../src/shared/index.ts";

// The counter has no Markdown syntax of its own, so it is written in the
// generic tag syntax. A plugin with a codec passes it here instead of [].
const check = createMarkdownRoundTrip([]);

const counter = (start: number): BlockNode => ({
  id: "c1",
  type: COUNTER_TYPE,
  v: COUNTER_VERSION,
  attrs: { start },
});

describe("Markdown round trip", () => {
  it("writes a counter as a generic tag and reads it back unchanged", () => {
    fc.assert(
      fc.property(fc.integer(), (start) => {
        expect(check.roundTrip(counter(start))).toContain(
          `type="${COUNTER_TYPE}"`,
        );
      }),
    );
  });

  it("keeps a counter while the plugin is uninstalled", () => {
    expect(check.survivesUninstall(counter(3))).toContain(
      `type="${COUNTER_TYPE}"`,
    );
  });
});
