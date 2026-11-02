import { definePlugin, escapeHtml, type BlockRenderer } from "@docleus/sdk";
import {
  COUNTER_TYPE,
  COUNTER_VERSION,
  PLUGIN_NAME,
  parseCounterProps,
} from "../shared/index.ts";

/**
 * Renders a counter as static markup inside its island element. The site
 * runtime mounts `dist/site/counter.js` on it, which makes the button count.
 */
export const renderCounter: BlockRenderer = (node) => {
  const { start } = parseCounterProps(node.attrs);
  return {
    html: `<div data-island="${escapeHtml(node.type)}" data-block="${escapeHtml(node.id)}"><button type="button">Count: ${start}</button></div>`,
    islands: [{ blockId: node.id, type: node.type, props: { start } }],
  };
};

/**
 * Registers the counter block type and its renderer. Everything registered
 * through `ctx` is undone when the plugin unloads.
 */
export const plugin = definePlugin({
  name: PLUGIN_NAME,
  inject: ["blocks", "render"],
  apply(ctx) {
    ctx.blocks.register(COUNTER_TYPE, { version: COUNTER_VERSION });
    ctx.render.registerBlock(COUNTER_TYPE, renderCounter);
  },
});
