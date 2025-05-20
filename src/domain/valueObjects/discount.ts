export class Discount {
  private constructor(private readonly code: string, private readonly value: number) { }

  static fromCode(code: string) {
    if (code === 'DISCOUNT20') {
      return new Discount(code, 0.8);
    }
    return new Discount(code, 1);
  }

  apply(price: number) {
    return price * this.value;
  }

  toDto() {
    return this.code;
  }
}
