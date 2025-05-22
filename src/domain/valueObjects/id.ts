export class Id {
  private constructor(private readonly value: string) { }

  static create(value: string) {
    return new Id(value);
  }

  toString() {
    return this.value;
  }
}
