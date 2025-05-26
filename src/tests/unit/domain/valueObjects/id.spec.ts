import { describe, expect, it } from "vitest";
import { Id } from "../../../../domain/valueObjects/id";

describe("Id", () => {
  it("should create an id with a custom value", () => {
    const id = Id.create("custom");
    expect(id.toString()).toBe("custom");
  });

  it("should compare two ids", () => {
    const id1 = Id.create("1");
    const id2 = Id.create("2");
    expect(id1.equals(id2)).toBe(false);
    expect(id2.equals(id1)).toBe(false);
  });
});
