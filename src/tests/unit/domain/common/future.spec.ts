import { describe, expect, it, vi } from "vitest";
import { Future } from "../../../../domain/common/future";
import { Result } from "../../../../domain/common/result";

describe("Future", () => {
  it("should be able to create a Future from a value", () => new Promise<void>((done, error) => {
    const future = Future.of(1);

    future.run(value => {
      expect(value).toBe(1);
      done();
    }, () => {
      error("Should not be called");
    });
  }));

  it("should be able to create a Future from a Promise that resolves", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.resolve(1));

    future.run(value => {
      expect(value).toBe(1);
      done();
    }, () => {
      error("Should not be called");
    });
  }));

  it("should be able to create a Future from a Promise that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected")));

    future.run(() => {
      error("Should not be called");
    }, error => {
      expect(error.message).toBe("Rejected");
      done();
    });
  }));

  it("should be able to create a Future from an ok Result", () => new Promise<void>((done, error) => {
    const future = Future.fromResult(Result.ok(1));

    future.run(value => {
      expect(value).toBe(1);
      done();
    }, () => {
      error("Should not be called");
    });
  }));

  it("should be able to create a Future from an error Result", () => new Promise<void>((done, error) => {
    const future = Future.fromResult(Result.error(new Error("Rejected")));

    future.run(() => {
      error("Should not be called");
    }, error => {
      expect(error.message).toBe("Rejected");
      done();
    });
  }));

  it("should map a Future to another Future", () => new Promise<void>((done, error) => {
    const future = Future.of(1);
    const mapped = future.map(value => value + 1);

    mapped.run(value => {
      expect(value).toBe(2);
      done();
    }, () => {
      error("Should not be called");
    });
  }));

  it("should return same error when mapping a Future that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected")));
    const mapped = future.map(value => value + 1);

    mapped.run(() => {
      error("Should not be called");
    }, error => {
      expect(error.message).toBe("Rejected");
      done();
    });
  }));

  it("should flatten a Future that resolves to a Future", () => new Promise<void>((done, error) => {
    const future = Future.of(1).flatMap(value => Future.of(value + 1));

    future.run(value => {
      expect(value).toBe(2);
      done();
    }, () => {
      error("Should not be called");
    });
  }));

  it("should flatten a Future that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected"))).flatMap(value => Future.of(value + 1));

    future.run(() => {
      error("Should not be called");
    }, error => {
      expect(error.message).toBe("Rejected");
      done();
    });
  }));
});
