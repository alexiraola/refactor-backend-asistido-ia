import { describe, expect, it } from "vitest";
import { OrderItem } from "../../../../domain/valueObjects/orderItem";
import { DomainError } from "../../../../domain/error";

describe("OrderItem", () => {
  it("should create an order item", () => {
    const orderItem = OrderItem.create("product", 1, 10);

    expect(orderItem.isOk()).toBe(true);
    expect(orderItem.get().total()).toBe(10);
  });

  it("should not allow zero quantity", () => {
    const orderItem = OrderItem.create("product", 0, 10);

    expect(orderItem.isOk()).toBe(false);
    expect(orderItem.getError()).toEqual(new DomainError("Quantity must be greater than 0"));
  });

  it("should not allow negative price", () => {
    const orderItem = OrderItem.create("product", 1, -10);

    expect(orderItem.isOk()).toBe(false);
    expect(orderItem.getError()).toEqual(new DomainError("Price must be greater than 0"));
  });
});
