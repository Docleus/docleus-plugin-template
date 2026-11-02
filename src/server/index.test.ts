import type { BlockNode, RenderContext } from "@docleus/sdk";
import { describe, expect, it } from "vitest";
import { COUNTER_TYPE } from "../shared/index.ts";
import { renderCounter } from "./index.ts";

const context: RenderContext = {
  children: () => ({ html: "", islands: [] }),
  anchor: (text) => text,
};

const counter = (attrs: Record<string, unknown>, id = "b1"): BlockNode => ({
  id,
  type: COUNTER_TYPE,
  v: 1,
  attrs,
});

describe("renderCounter", () => {
  it("renders the start value inside an island element", () => {
    expect(renderCounter(counter({ start: 7 }), context)).toEqual({
      html: '<div data-island="template.counter" data-block="b1"><button type="button">Count: 7</button></div>',
      islands: [{ blockId: "b1", type: COUNTER_TYPE, props: { start: 7 } }],
    });
  });

  it.each([{}, { start: "<b>" }, { start: 2.5 }])(
    "starts at 0 for attrs %j",
    (attrs) => {
      const result = renderCounter(counter(attrs), context);
      expect(result.html).toContain("Count: 0</button>");
      expect(result.islands).toEqual([
        { blockId: "b1", type: COUNTER_TYPE, props: { start: 0 } },
      ]);
    },
  );

  it("matches the render snapshot", () => {
    expect(
      renderCounter(counter({ start: 1 }), context).html,
    ).toMatchSnapshot();
  });

  it("escapes the block id", () => {
    const result = renderCounter(counter({}, '"><script>'), context);
    expect(result.html).toContain('data-block="&quot;&gt;&lt;script&gt;"');
    expect(result.html).not.toContain("<script>");
    expect(result.islands[0]?.blockId).toBe('"><script>');
  });
});
