/** An example interactive block: a button that counts clicks on published sites. */
export const COUNTER_TYPE = "template.counter";
export const COUNTER_VERSION = 1;

/** The attrs of a counter block, and the props of its island. */
export interface CounterProps {
  readonly start: number;
}

// The SDK does not re-export zod, and plugins may only depend on the SDK and
// their own libraries, so this validator is written by hand.
/** Reads `start` from block attrs or island props; anything but an integer becomes 0. */
export function parseCounterProps(value: unknown): CounterProps {
  const start =
    typeof value === "object" && value !== null && "start" in value
      ? value.start
      : undefined;
  return {
    start: typeof start === "number" && Number.isSafeInteger(start) ? start : 0,
  };
}
