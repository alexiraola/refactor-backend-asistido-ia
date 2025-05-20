import { Discount } from "../valueObjects/discount";
import { OrderItem } from "../valueObjects/orderItem";

export enum OrderStatus {
  Created = "CREATED",
  Completed = "COMPLETED",
}

export class Order {
  private constructor(
    private readonly items: OrderItem[],
    private discount: Discount,
    private shippingAddress: string,
    private status: OrderStatus,
  ) { }

  static create(items: OrderItem[], discount: Discount, shippingAddress: string) {
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    return new Order(items, discount, shippingAddress, OrderStatus.Created);
  }

  total() {
    const total = this.items.reduce((total, item) => total + item.total(), 0);
    return this.discount.apply(total);
  }

  complete() {
    if (this.status !== OrderStatus.Created) {
      throw new Error(`Cannot complete an order with status: ${this.status}`);
    }
    this.status = OrderStatus.Completed;
  }

  toDto() {
    return {
      items: this.items.map(item => item.toDto()),
      discountCode: this.discount.toDto(),
      shippingAddress: this.shippingAddress,
      total: this.total(),
      status: this.status,
    };
  }
}
