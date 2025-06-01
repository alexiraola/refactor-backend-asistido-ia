import { Result } from "../common/result";
import { DomainError } from "../error";

export class OrderItem {
  private constructor(
    private readonly productId: string,
    private readonly quantity: number,
    private readonly price: number,
  ) { }

  static create(productId: string, quantity: number, price: number): Result<OrderItem, DomainError> {
    if (quantity < 1) {
      return Result.error(new DomainError("Quantity must be greater than 0"));
    }
    if (price < 0) {
      return Result.error(new DomainError("Price must be greater than 0"));
    }
    return Result.ok(new OrderItem(productId, quantity, price));
  }

  total() {
    return this.quantity * this.price;
  }

  toDto() {
    return {
      productId: this.productId,
      quantity: this.quantity,
      price: this.price,
    };
  }
}
