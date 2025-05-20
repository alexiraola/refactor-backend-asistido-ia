import { describe, expect, it } from "vitest";
import { Id } from "../../../../domain/valueObjects/id";

describe("Id", () => {
  it("should create an id", () => {
    const id = Id.create();
    expect(id.toString()).toBeDefined();
  });

  it("should create an id with a custom value", () => {
    const id = Id.create("custom");
    expect(id.toString()).toBe("custom");
  });
});
