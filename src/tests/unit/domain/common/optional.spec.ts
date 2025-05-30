import { describe, expect, it, vi } from "vitest";
import { Optional } from "../../../../domain/common/optional";

describe("Optional", () => {
  it("should create some with value", () => {
    const option = Optional.some(1);
    expect(option.isSome()).toBe(true);
  });

  it("should create none", () => {
    const option = Optional.none();
    expect(option.isSome()).toBe(false);
  });

  it("should create some from nullable", () => {
    const option = Optional.ofNullable(1);
    expect(option.isSome()).toBe(true);
  });

  it("should create none from nullable", () => {
    const option = Optional.ofNullable<number>(null);
    expect(option.isSome()).toBe(false);
  });

  it("should get the value", () => {
    const option = Optional.ofNullable(1);
    expect(option.getOrElse(0)).toBe(1);
  });

  it("should return default value", () => {
    const option = Optional.ofNullable<number>(null);
    expect(option.getOrElse(0)).toBe(0);
  });

  it("should map value", () => {
    const option = Optional.ofNullable(1);
    const mapped = option.map((value) => value + 1);
    expect(mapped.getOrElse(0)).toBe(2);
  });

  it("should flat map a value", () => {
    const option = Optional.ofNullable(1);
    const mapped = option.flatMap((value) => Optional.ofNullable(value + 1));
    expect(mapped.getOrElse(0)).toBe(2);
  });

  it("should call some function when match method called", () => {
    const option = Optional.ofNullable(1);

    const someSpy = vi.fn();
    const noneSpy = vi.fn();

    option.match(someSpy, noneSpy);

    expect(someSpy).toHaveBeenCalledWith(1);
    expect(noneSpy).not.toHaveBeenCalled();
  });

  it("should call none function when match method called", () => {
    const option = Optional.none();

    const someSpy = vi.fn();
    const noneSpy = vi.fn();

    option.match(someSpy, noneSpy);

    expect(someSpy).not.toHaveBeenCalled();
    expect(noneSpy).toHaveBeenCalled();
    expect(noneSpy).toHaveBeenCalledTimes(1);
  });
});
