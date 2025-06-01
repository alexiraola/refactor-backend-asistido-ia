import { Result } from "./result";

export class Future<T, E = Error> {
  private constructor(
    private task: (resolve: (value: T) => void, reject: (error: E) => void) => void
  ) { }

  static of<T, E = Error>(value: T): Future<T, E> {
    return new Future((resolve, reject) => {
      resolve(value);
    });
  }

  static fromPromise<T, E = Error>(promise: Promise<T>): Future<T, E> {
    return new Future((resolve, reject) => promise.then(resolve).catch(reject));
  }

  static fromResult<T, E = Error>(result: Result<T, E>): Future<T, E> {
    return new Future((resolve, reject) => result.match(resolve, reject));
  }

  run(onResolve: (value: T) => void, onReject: (error: E) => void): void {
    this.task(onResolve, onReject);
  }

  map<U>(mapper: (value: T) => U): Future<U, E> {
    return new Future((resolve, reject) => {
      this.run(value => resolve(mapper(value)), reject);
    });
  }

  flatMap<U, F = Error>(mapper: (value: T) => Future<U, F>): Future<U, F | E> {
    return new Future((resolve, reject) => {
      this.run(value => mapper(value).run(resolve, reject), reject);
    });
  }
}
