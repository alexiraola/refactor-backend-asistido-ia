export class Id {
  private constructor(private readonly value: string) { }

  static create(value: string) {
    return new Id(value);
  }

  equals(other: Id) {
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }
}
