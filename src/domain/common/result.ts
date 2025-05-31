type Ok<T> = {
  ok: true,
  value: T
};

type Error<E> = {
  ok: false,
  error: E
};

type ResultType<T, E> = Ok<T> | Error<E>;

export class Result<T, E> {
  private constructor(private readonly result: ResultType<T, E>) { }

  static ok<T, E>(value: T): Result<T, E> {
    return new Result({ ok: true, value });
  }

  static error<T, E>(error: E): Result<T, E> {
    return new Result({ ok: false, error });
  }

  static fromTry<T, E>(fn: () => T): Result<T, E> {
    try {
      return Result.ok(fn());
    } catch (error: any) {
      return Result.error(error);
    }
  }

  static async fromTryAsync<T, E>(fn: () => Promise<T>): Promise<Result<T, E>> {
    try {
      return Result.ok(await fn());
    } catch (error: any) {
      return Result.error(error);
    }
  }

  isOk(): boolean {
    return this.result.ok;
  }

  isError(): boolean {
    return !this.result.ok;
  }

  getOrElse(defaultValue: T): T {
    return this.result.ok ? this.result.value : defaultValue;
  }

  getError(): E {
    if (!this.result.ok) {
      return this.result.error;
    }
    throw new Error("Result is not an error");
  }

  map<R>(fn: (value: T) => R): Result<R, E> {
    return this.result.ok
      ? Result.ok(fn(this.result.value))
      : Result.error(this.result.error);
  }

  mapError<R>(fn: (error: E) => R): Result<T, R> {
    return this.result.ok
      ? Result.ok(this.result.value)
      : Result.error(fn(this.result.error));
  }

  flatMap<R>(fn: (value: T) => Result<R, E>): Result<R, E> {
    return this.result.ok ? fn(this.result.value) : Result.error(this.result.error);
  }

  match<R>(okFn: (value: T) => R, errFn: (error: E) => R): R {
    return this.result.ok ? okFn(this.result.value) : errFn(this.result.error);
  }
}

