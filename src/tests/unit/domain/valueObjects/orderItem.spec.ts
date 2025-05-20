import { describe, expect, it } from "vitest";
import { OrderItem } from "../../../../domain/valueObjects/orderItem";

describe("OrderItem", () => {
  it("should create an order item", () => {
    const orderItem = OrderItem.create("product", 1, 10);

    expect(orderItem.total()).toBe(10);
  });

  it("should not allow less than one quantity", () => {
    expect(() => OrderItem.create("product", 0, 10)).toThrow();
    expect(() => OrderItem.create("product", -1, 10)).toThrow();
  });

  it("should not allow negative price", () => {
    expect(() => OrderItem.create("product", 1, -10)).toThrow();
  });
});
