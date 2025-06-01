import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrdersService } from "../../../application/orders.service";
import { InMemoryOrdersRepository } from "../../../domain/repositories/orders.repository";
import { Order } from "../../../domain/entities/order";
import { Discount } from "../../../domain/valueObjects/discount";
import { Id } from "../../../domain/valueObjects/id";
import { OrderItem } from "../../../domain/valueObjects/orderItem";
import { FakeNotifier } from "../../factory";

describe("OrdersService", () => {
  let repository: InMemoryOrdersRepository;
  let service: OrdersService;
  let notifier: FakeNotifier;

  beforeEach(() => {
    repository = new InMemoryOrdersRepository();
    notifier = new FakeNotifier();
    service = new OrdersService(repository, notifier);
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
    expect((await repository.findAll()).getOrElse([])).toHaveLength(1);
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
    expect((await repository.findAll()).getOrElse([])).toHaveLength(1);
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
    expect((await repository.findAll()).getOrElse([])).toHaveLength(1);
  });

  it("should get all orders", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.getAllOrders();
    expect(result.getOrElse([])).toHaveLength(1);
  });

  it("should complete an order", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.completeOrder(order.getId().toString());
    expect(result).toBe("Order with id 0 completed");
    expect((await repository.findAll()).getOrElse([])).toHaveLength(1);
  });

  it("should delete an order", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const result = await service.deleteOrder(order.getId().toString());
    expect(result).toBe("Order deleted");
    expect((await repository.findAll()).getOrElse([])).toHaveLength(0);
  });

  it("should notify when an order is created", async () => {
    const spy = vi.spyOn(notifier, "notify");

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

    expect(spy).toHaveBeenCalledWith("New order created: 0. Total: 8");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should notify when an order is completed", async () => {
    const order = createValidOrder();
    await repository.save(order);

    const spy = vi.spyOn(notifier, "notify");

    await service.completeOrder(order.getId().toString());

    expect(spy).toHaveBeenCalledWith("Order completed: 0");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

function createValidOrder() {
  const order = Order.createResult(
    Id.create("0"),
    [
      OrderItem.create(
        "1", 1, 10
      ).get()],
    Discount.fromCode("DISCOUNT20").get(),
    "Nowhere Avenue",
  ).get();
  return order;
}
