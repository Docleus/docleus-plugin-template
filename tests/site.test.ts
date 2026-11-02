import {
  ISLAND_SCRIPT_ID,
  type BlockNode,
  type Entry,
  type IslandManifest,
  type SitePage,
} from "@docleus/sdk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COUNTER_TYPE } from "../src/shared/index.ts";
import { loadPlugin, type Instance } from "./instance.ts";

const counter = (id: string, attrs: Record<string, unknown>): BlockNode => ({
  id,
  type: COUNTER_TYPE,
  v: 1,
  attrs,
});

function sitePage(body: BlockNode): SitePage {
  const entry: Entry = {
    id: "e1",
    type: "page",
    title: "Counters",
    parent: undefined,
    order: 0,
    fields: {},
    body,
  };
  return {
    kind: "page",
    site: { id: "s1", name: "Site", settings: undefined },
    space: { id: "sp1", orgId: "o1", slug: "docs", name: "Docs" },
    revision: "r1",
    entry,
    path: "/",
    title: entry.title,
    nav: [],
    prev: undefined,
    next: undefined,
    url: (path) => `.${path}`,
    asset: (plugin, file) => `./_assets/plugins/${plugin}/${file}`,
  };
}

function islandManifest(html: string): IslandManifest | undefined {
  const match = new RegExp(
    `<script type="application/json" id="${ISLAND_SCRIPT_ID}">(.*?)</script>`,
  ).exec(html);
  return match?.[1] === undefined
    ? undefined
    : (JSON.parse(match[1]) as IslandManifest);
}

const BODY: BlockNode = {
  id: "doc",
  type: "doc",
  v: 1,
  attrs: {},
  content: [counter("c1", { start: 2 }), counter("c2", {})],
};

const ISLAND_URL = "./_assets/plugins/docleus-plugin-template@0.0.1/counter.js";

describe("published pages", () => {
  let instance: Instance;

  beforeEach(async () => {
    instance = await loadPlugin();
  });

  afterEach(async () => {
    await instance.dispose();
  });

  it("render counters as islands with their props in the page head", () => {
    const { html, islands } = instance.root.render.renderPage(sitePage(BODY), {
      islandUrl: (type) => (type === COUNTER_TYPE ? ISLAND_URL : undefined),
    });
    expect(html).toContain(
      '<div data-island="template.counter" data-block="c1"><button type="button">Count: 2</button></div>',
    );
    expect(islands.map((island) => island.blockId)).toEqual(["c1", "c2"]);
    expect(islandManifest(html)).toEqual({
      modules: { [COUNTER_TYPE]: ISLAND_URL },
      props: { c1: { start: 2 }, c2: { start: 0 } },
    });
  });

  it("render counters as placeholders once the plugin unloads", async () => {
    await instance.unloadPlugin();
    const { html, islands } = instance.root.render.renderPage(sitePage(BODY));
    expect(html).toContain('<div data-unknown-block="template.counter"></div>');
    expect(islands).toEqual([]);
  });
});
