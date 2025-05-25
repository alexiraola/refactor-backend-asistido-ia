import { DomainError } from "../error";

export class OrderItem {
  private constructor(
    private readonly productId: string,
    private readonly quantity: number,
    private readonly price: number,
  ) { }

  static create(productId: string, quantity: number, price: number) {
    if (quantity < 1) {
      throw new DomainError("Quantity must be greater than 0");
    }
    if (price < 0) {
      throw new DomainError("Price must be greater than 0");
    }
    return new OrderItem(productId, quantity, price);
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
