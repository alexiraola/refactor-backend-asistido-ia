import { beforeEach, describe, expect, it } from "vitest";
import { OrdersService } from "../../../application/orders.service";
import { InMemoryOrdersRepository } from "../../../domain/repositories/orders.repository";
import { Order } from "../../../domain/entities/order";
import { Discount } from "../../../domain/valueObjects/discount";
import { Id } from "../../../domain/valueObjects/id";
import { OrderItem } from "../../../domain/valueObjects/orderItem";
import { FakeNotifier } from "../../../domain/notifier";

describe("OrdersService", () => {
  let repository: InMemoryOrdersRepository;
  let service: OrdersService;

  beforeEach(() => {
    repository = new InMemoryOrdersRepository();
    service = new OrdersService(repository, new FakeNotifier());
  });

  it("should create an order from a request", async () => {
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
    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should create an order from a request with discount", async () => {
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
    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should update an order from a request", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.updateOrder({
      id: order.getId().toString(),
      discountCode: "INVALID",
      shippingAddress: "Nowhere Avenue",
      status: "CREATED",
    });

    expect(result).toBe("Order updated. New status: CREATED");
    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should get all orders", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.getAllOrders();
    expect(result).toHaveLength(1);
  });

  it("should complete an order", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.completeOrder(order.getId().toString());
    expect(result).toBe("Order with id 0 completed");
    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("should delete an order", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.deleteOrder(order.getId().toString());
    expect(result).toBe("Order deleted");
    await expect(repository.findAll()).resolves.toHaveLength(0);
  });
});

function createValidOrder() {
  const order = Order.create(
    Id.create("0"),
    [
      OrderItem.create(
        "1", 1, 10
      )],
    Discount.fromCode("DISCOUNT20"),
    "Nowhere Avenue",
  );
  return order;
}
