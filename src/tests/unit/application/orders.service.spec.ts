import { describe, expect, it } from "vitest";
import { OrdersService } from "../../../application/orders.service";
import { InMemoryOrdersRepository } from "../../../domain/repositories/orders.repository";

describe("OrdersService", () => {
  it("should create an order from a request", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    const result = await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "INVALID",
      shippingAddress: "Nowhere Avenue",
    });

    expect(result).toBe("Order created with total: 10");
    expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should create an order from a request with discount", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    const result = await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    });

    expect(result).toBe("Order created with total: 8");
    expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should update an order from a request", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    });

    const result = await service.updateOrder({
      id: "0",
      discountCode: "INVALID",
      shippingAddress: "Nowhere Avenue",
      status: "CREATED",
    });

    expect(result).toBe("Order updated. New status: CREATED");
    expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should get all orders", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    });

    const result = await service.getAllOrders();
    expect(result).toHaveLength(1);
  });

  it("should complete an order", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    });

    const result = await service.completeOrder("0");
    expect(result).toBe("Order with id 0 completed");
    expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should delete an order", async () => {
    const repository = new InMemoryOrdersRepository();
    const service = new OrdersService(repository);
    await service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    });

    const result = await service.deleteOrder("0");
    expect(result).toBe("Order deleted");
    expect(repository.findAll()).resolves.toHaveLength(0);
  });
});
