import {
  definePlugin,
  type EditorBlockDefinition,
  type EditorSlashItem,
} from "@docleus/sdk";
import { COUNTER_TYPE, COUNTER_VERSION, PLUGIN_NAME } from "../shared/index.ts";

export const COUNTER_BLOCK: EditorBlockDefinition = {
  type: COUNTER_TYPE,
  version: COUNTER_VERSION,
  content: "atom",
  attrs: { start: 0 },
};

export const COUNTER_SLASH_ITEM: EditorSlashItem = {
  id: COUNTER_TYPE,
  label: "Counter",
  keywords: ["button", "click"],
  run(editor) {
    editor.insertBlock(COUNTER_TYPE, { start: 0 });
  },
};

/**
 * Registers the counter block and a slash menu item that inserts it with
 * the editor. Everything is undone when the plugin unloads.
 */
export const plugin = definePlugin({
  name: PLUGIN_NAME,
  inject: ["editor"],
  apply(ctx) {
    ctx.editor.registerBlock(COUNTER_BLOCK);
    ctx.editor.registerSlashItem(COUNTER_SLASH_ITEM);
  },
});
