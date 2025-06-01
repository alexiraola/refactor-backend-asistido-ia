import { Result } from "../common/result";
import { DomainError } from "../error";

export class Discount {
  private constructor(private readonly code: string, private readonly value: number) { }

  static fromCode(code: string): Result<Discount, DomainError> {
    if (code === 'DISCOUNT20') {
      return Result.ok(new Discount(code, 0.8));
    }
    return Result.ok(new Discount(code, 1));
  }

  apply(price: number) {
    return price * this.value;
  }

  toDto() {
    return this.code;
  }
}
