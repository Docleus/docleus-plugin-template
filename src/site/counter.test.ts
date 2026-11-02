// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "./counter.ts";

function island(): HTMLElement {
  const element = document.createElement("div");
  element.innerHTML = '<button type="button">Count: 3</button>';
  document.body.append(element);
  return element;
}

const button = (element: HTMLElement): HTMLButtonElement => {
  const found = element.querySelector("button");
  if (!found) throw new Error("no button");
  return found;
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("counter island", () => {
  it("counts clicks from the start prop", () => {
    const element = island();
    mount(element, { start: 3 });
    expect(element.querySelectorAll("button")).toHaveLength(1);
    expect(button(element).type).toBe("button");
    expect(button(element).textContent).toBe("Count: 3");
    button(element).click();
    button(element).click();
    expect(button(element).textContent).toBe("Count: 5");
  });

  it.each([undefined, null, { start: "3" }, { start: 0.5 }])(
    "starts at 0 for props %j",
    (props) => {
      const element = island();
      mount(element, props);
      expect(button(element).textContent).toBe("Count: 0");
    },
  );

  it("stops counting after cleanup", () => {
    const element = island();
    const cleanup = mount(element, { start: 1 });
    button(element).click();
    cleanup();
    button(element).click();
    expect(button(element).textContent).toBe("Count: 2");
  });
});
