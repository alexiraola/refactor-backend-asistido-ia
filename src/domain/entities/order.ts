import { Result } from "../common/result";
import { DomainError } from "../error";
import { Discount } from "../valueObjects/discount";
import { Id } from "../valueObjects/id";
import { OrderItem } from "../valueObjects/orderItem";

export enum OrderStatus {
  Created = "CREATED",
  Completed = "COMPLETED",
}

export class Order {
  private constructor(
    private readonly id: Id,
    private readonly items: OrderItem[],
    private discount: Discount,
    private shippingAddress: string,
    private status: OrderStatus,
  ) { }

  static create(id: Id, items: OrderItem[], discount: Discount, shippingAddress: string, status = OrderStatus.Created): Result<Order, DomainError> {
    if (items.length === 0) {
      return Result.error(new DomainError("The order must have at least one item"));
    }
    return Result.ok(new Order(id, items, discount, shippingAddress, status));
  }

  update(discountCode?: string, shippingAddress?: string, status?: OrderStatus): Result<void, DomainError> {
    if (discountCode) {
      this.discount = Discount.fromCode(discountCode);
    }
    if (shippingAddress) {
      this.shippingAddress = shippingAddress;
    }
    if (status === OrderStatus.Completed) {
      return this.complete();
    }
    return Result.ok();
  }

  getId() {
    return this.id;
  }

  total() {
    const total = this.items.reduce((total, item) => total + item.total(), 0);
    return this.discount.apply(total);
  }

  complete(): Result<void, DomainError> {
    if (this.status !== OrderStatus.Created) {
      return Result.error(new DomainError(`Cannot complete an order with status: ${this.status}`));
    }
    this.status = OrderStatus.Completed;

    return Result.ok();
  }

  toDto() {
    return {
      _id: this.id.toString(),
      items: this.items.map(item => item.toDto()),
      discountCode: this.discount.toDto(),
      shippingAddress: this.shippingAddress,
      total: this.total(),
      status: this.status,
    };
  }

  equals(other: Order) {
    return this.id.equals(other.id);
  }
}
