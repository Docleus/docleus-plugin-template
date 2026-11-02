import { parseCounterProps } from "../shared/counter.ts";

/**
 * Island module of `template.counter`: the site runtime calls it with the
 * block's `data-island` element and the props its renderer returned.
 */
export function mount(element: HTMLElement, props: unknown): () => void {
  let count = parseCounterProps(props).start;
  const button = document.createElement("button");
  button.type = "button";
  const show = (): void => {
    button.textContent = `Count: ${count}`;
  };
  const increment = (): void => {
    count += 1;
    show();
  };
  show();
  button.addEventListener("click", increment);
  // Islands are mounted, not hydrated, so the server markup is replaced.
  element.replaceChildren(button);
  return () => button.removeEventListener("click", increment);
}
