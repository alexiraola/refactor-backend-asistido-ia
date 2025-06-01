import { describe, expect, it } from "vitest";
import { Future } from "../../../../domain/common/future";
import { Result } from "../../../../domain/common/result";

describe("Future", () => {
  it("should be able to create a Future from a value", () => new Promise<void>((done, error) => {
    const future = Future.of(1);
    expectResolved(future, 1).then(done, error);
  }));

  it("should be able to create a Future from a Promise that resolves", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.resolve(1));
    expectResolved(future, 1).then(done, error);
  }));

  it("should be able to create a Future from a Promise that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected")));
    expectRejected(future, new Error("Rejected")).then(done, error);
  }));

  it("should be able to create a Future from an ok Result", () => new Promise<void>((done, error) => {
    const future = Future.fromResult<number, Error>(Result.ok(1));
    expectResolved(future, 1).then(done, error);
  }));

  it("should be able to create a Future from an error Result", () => new Promise<void>((done, error) => {
    const future = Future.fromResult(Result.error(new Error("Rejected")));
    expectRejected(future, new Error("Rejected")).then(done, error);
  }));

  it("should map a Future to another Future", () => new Promise<void>((done, error) => {
    const future = Future.of(1);
    const mapped = future.map(value => value + 1);

    expectResolved(mapped, 2).then(done, error);
  }));

  it("should return same error when mapping a Future that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected")));
    const mapped = future.map(value => value + 1);

    expectRejected(mapped, new Error("Rejected")).then(done, error);
  }));

  it("should flatten a Future that resolves to a Future", () => new Promise<void>((done, error) => {
    const future = Future.of(1).flatMap(value => Future.of(value + 1));
    expectResolved(future, 2).then(done, error);
  }));

  it("should flatten a Future that rejects", () => new Promise<void>((done, error) => {
    const future = Future.fromPromise(Promise.reject(new Error("Rejected"))).flatMap(value => Future.of(value + 1));
    expectRejected(future, new Error("Rejected")).then(done, error);
  }));
});

async function expectResolved<T>(future: Future<T>, value: T) {
  future.run(resolvedValue => {
    expect(resolvedValue).toBe(value);
  }, () => {
    throw new Error("Should not be called");
  });
}

async function expectRejected<E>(future: Future<unknown, E>, error: E) {
  future.run(() => {
    throw new Error("Should not be called");
  }, rejectedError => {
    expect(rejectedError).toEqual(error);
  });
}
