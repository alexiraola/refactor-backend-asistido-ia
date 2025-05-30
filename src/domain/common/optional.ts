enum OptionalType {
  Some,
  None,
}

export class Optional<T> {
  private constructor(private readonly type: OptionalType, private readonly value?: T) { }

  static some<T>(value: T): Optional<T> {
    return new Optional(OptionalType.Some, value);
  }

  static none<T>(): Optional<T> {
    return new Optional<T>(OptionalType.None);
  }

  static ofNullable<T>(value: T | null): Optional<T> {
    if (value === null) {
      return Optional.none<T>();
    } else {
      return Optional.some(value);
    }
  }

  isSome(): boolean {
    return this.type === OptionalType.Some;
  }

  getOrElse(defaultValue: T): T {
    return this.value || defaultValue;
  }

  map<R>(fn: (value: T) => R): Optional<R> {
    return this.isSome()
      ? Optional.ofNullable(fn(this.value as T))
      : Optional.none();
  }

  flatMap<R>(fn: (value: T) => Optional<R>): Optional<R> {
    return this.isSome() ? fn(this.value as T) : Optional.none();
  }

  match<R>(someFn: (value: T) => R, noneFn: () => R): R {
    return this.isSome() ? someFn(this.value as T) : noneFn();
  }
}
