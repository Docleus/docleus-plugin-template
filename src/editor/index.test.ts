import {
  Context,
  trackCaller,
  type EditorHandle,
  type EditorService,
} from "@docleus/sdk";
import { describe, expect, it } from "vitest";
import { COUNTER_TYPE } from "../shared/index.ts";
import { COUNTER_SLASH_ITEM, plugin } from "./index.ts";

function fakeEditorService(owner: Context) {
  const registered = new Set<string>();
  const add = (caller: Context, key: string) =>
    caller.effect(() => {
      registered.add(key);
      return () => registered.delete(key);
    }, key);
  const service = trackCaller<EditorService>(owner, {
    registerBlock(definition) {
      return add(this.ctx, `block:${definition.type}`);
    },
    registerInline(definition) {
      return add(this.ctx, `inline:${definition.type}`);
    },
    registerMark(definition) {
      return add(this.ctx, `mark:${definition.type}`);
    },
    registerToolbarItem(item) {
      return add(this.ctx, `toolbar:${item.id}`);
    },
    registerSlashItem(item) {
      return add(this.ctx, `slash:${item.id}`);
    },
    registerExtension() {
      return add(this.ctx, "extension");
    },
    registerCollaboration() {
      return add(this.ctx, "collaboration");
    },
  });
  return { service, registered };
}

describe("editor plugin", () => {
  it("registers the counter block and slash item until it unloads", async () => {
    const root = new Context();
    const { service, registered } = fakeEditorService(root);
    root.provide("editor", service);
    const fiber = await root.plugin(plugin);
    expect([...registered].toSorted()).toEqual([
      `block:${COUNTER_TYPE}`,
      `slash:${COUNTER_TYPE}`,
    ]);
    await fiber.dispose();
    expect(registered.size).toBe(0);
  });

  it("inserts a counter from the slash menu", () => {
    const calls: unknown[][] = [];
    const editor = {
      insertBlock: (...args: unknown[]) => {
        calls.push(args);
        return true;
      },
    } as unknown as EditorHandle;
    COUNTER_SLASH_ITEM.run(editor);
    expect(calls).toEqual([[COUNTER_TYPE, { start: 0 }]]);
  });
});
