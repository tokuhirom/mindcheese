import { describe, expect, it } from "vitest";
import { RoundRobin } from "../../src/mindmap/utils/RoundRobin";

const p = new RoundRobin<string>(["a", "b", "c"]);
describe("RoundRobin basic functionality", () => {
  it("cycles through elements correctly", () => {
    expect([p.take(), p.take(), p.take(), p.take(), p.take()]).toStrictEqual([
      "a",
      "b",
      "c",
      "a",
      "b",
    ]);
  });
});
