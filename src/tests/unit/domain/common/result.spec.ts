import { describe, expect, it } from "vitest";
import { Result } from "../../../../domain/common/result";

describe("Result", () => {
  it("should create a success Result", () => {
    const result = Result.ok("success");
    expect(result.isOk()).toBe(true);
    expect(result.isError()).toBe(false);
  });

  it("should create a error Result", () => {
    const result = Result.error("error");
    expect(result.isOk()).toBe(false);
    expect(result.isError()).toBe(true);
  });

  it("should return the value of a success Result", () => {
    const result = Result.ok("success");
    expect(result.getOrElse("default")).toBe("success");
  });

  it("should return the default value of a error Result", () => {
    const result = Result.error("error");
    expect(result.getOrElse("default")).toBe("default");
  });

  it("should map a success Result", () => {
    const result = Result.ok("success").map(value => value.toUpperCase());
    expect(result.getOrElse("default")).toBe("SUCCESS");
  });

  it("should make no effect mapping a error Result", () => {
    const result = Result.error<string, string>("error").map(value => value.toUpperCase());
    expect(result.getOrElse("default")).toBe("default");
  });

  it("should flatMap a success Result", () => {
    const result = Result.ok("success").flatMap(value => Result.ok(value.toUpperCase()));
    expect(result.getOrElse("default")).toBe("SUCCESS");
  });

  it("should make no effect flatMapping a error Result", () => {
    const result = Result.error<string, string>("error").flatMap(value => Result.ok(value.toUpperCase()));
    expect(result.getOrElse("default")).toBe("default");
  });

  it("should mapError an error Result", () => {
    const result = Result.error("error").mapError(error => error.toUpperCase());
    expect(result.getError()).toBe("ERROR");
  });

  it("should throw an error if getError is called on a success Result", () => {
    const result = Result.ok("success");
    expect(() => result.getError()).toThrow("Result is not an error");
  });

  it("should match a success Result", () => {
    const result = Result.ok<string, string>("success").match(
      value => value.toUpperCase(),
      error => error.toLowerCase()
    );
    expect(result).toBe("SUCCESS");
  });

  it("should match a error Result", () => {
    const result = Result.error<string, string>("ERROR").match(
      value => value.toUpperCase(),
      error => error.toLowerCase()
    );
    expect(result).toBe("error");
  });
});
