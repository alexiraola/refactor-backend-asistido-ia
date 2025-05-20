import { describe, expect, it } from "vitest";
import { OrderItem } from "../../../../domain/valueObjects/orderItem";
import { Order } from "../../../../domain/entities/order";
import { Discount } from "../../../../domain/valueObjects/discount";

describe("Order", () => {
  it("should create an order", () => {
    const order = Order.create([OrderItem.create(
      "1", 1, 10
    )], Discount.fromCode("DISCOUNT20"), "Nowhere Avenue");
    expect(order).toBeInstanceOf(Order);
  });

  it("should throw if no items are provided", () => {
    expect(() => Order.create([], Discount.fromCode("DISCOUNT20"), "Nowhere Avenue")).toThrow();
  });

  it("should calculate the total", () => {
    const order = Order.create([OrderItem.create(
      "1", 1, 10
    )], Discount.fromCode("DISCOUNT"), "Nowhere Avenue");
    expect(order.total()).toBe(10);
  });

  it("should calculate the total with discount", () => {
    const order = Order.create([OrderItem.create(
      "1", 1, 10
    )], Discount.fromCode("DISCOUNT20"), "Nowhere Avenue");
    expect(order.total()).toBe(8);
  });

  it("should mark order as completed", () => {
    const order = Order.create([OrderItem.create(
      "1", 1, 10
    )], Discount.fromCode("DISCOUNT20"), "Nowhere Avenue");
    order.complete();

    expect(order.toDto().status).toBe("COMPLETED");
  });

  it("should throw if trying to complete an already completed order", () => {
    const order = Order.create([OrderItem.create(
      "1", 1, 10
    )], Discount.fromCode("DISCOUNT20"), "Nowhere Avenue");
    order.complete();
    expect(() => order.complete()).toThrow();
  });
});
