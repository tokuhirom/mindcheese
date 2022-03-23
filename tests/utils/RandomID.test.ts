import { generateNewId } from "../../src/mindmap/utils/RandomID";

test("basic", () => {
  const p = generateNewId();
  console.log(p);
  expect(p.length).toStrictEqual(14);
});
