import { RoundRobin } from "../../src/mindmap/utils/RoundRobin";

const p = new RoundRobin<string>(["a", "b", "c"]);
test("basic", () => {
  expect([p.take(), p.take(), p.take(), p.take(), p.take()]).toStrictEqual([
    "a",
    "b",
    "c",
    "a",
    "b",
  ]);
});
