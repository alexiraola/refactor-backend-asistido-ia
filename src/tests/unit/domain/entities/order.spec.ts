import { describe, expect, it } from "vitest";
import { OrderItem } from "../../../../domain/valueObjects/orderItem";
import { Order } from "../../../../domain/entities/order";
import { Discount } from "../../../../domain/valueObjects/discount";
import { Id } from "../../../../domain/valueObjects/id";

describe("Order", () => {
  it("should create an order", () => {
    const order = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    expect(order).toBeInstanceOf(Order);
  });

  it("should throw if no items are provided", () => {
    expect(() => Order.create(Id.create("1"), [], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get()).toThrow();
  });

  it("should calculate the total", () => {
    const order = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT").get(), "Nowhere Avenue").get();
    expect(order.total()).toBe(10);
  });

  it("should calculate the total with discount", () => {
    const order = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    expect(order.total()).toBe(8);
  });

  it("should mark order as completed", () => {
    const order = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    order.complete();

    expect(order.toDto().status).toBe("COMPLETED");
  });

  it("should throw if trying to complete an already completed order", () => {
    const order = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    order.complete();
    expect(() => order.complete()).toThrow();
  });

  it("should compare two orders", () => {
    const order1 = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    const order2 = Order.create(Id.create("2"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();
    const order3 = Order.create(Id.create("1"), [OrderItem.create(
      "1", 1, 10
    ).get()], Discount.fromCode("DISCOUNT20").get(), "Nowhere Avenue").get();

    expect(order1.equals(order2)).toBe(false);
    expect(order2.equals(order1)).toBe(false);
    expect(order1.equals(order3)).toBe(true);
  });
});
