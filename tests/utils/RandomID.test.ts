import { describe, expect, it } from 'vitest';
import { generateNewId } from "../../src/mindmap/utils/RandomID";

describe("RandomID generator functionality", () => {
  it("generates an ID of correct length", () => {
    const p = generateNewId();
    console.log(p);
    expect(p.length).toStrictEqual(14);
  });
});
