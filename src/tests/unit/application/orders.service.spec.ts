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

  it("should create an order from a request", () => new Promise<void>(async (done, error) => {
    const result = service.createOrder({
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

    result.run(message => expect(message).toBe("Order created with total: 10"), error);

    repository.findAll().run(orders => {
      expect(orders).toHaveLength(1);
      done();
    }, error);
  }));

  it("should create an order from a request with discount", () => new Promise<void>(async (done, error) => {
    const result = service.createOrder({
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

    result.run(message => expect(message).toBe("Order created with total: 8"), error);

    repository.findAll().run(orders => {
      expect(orders).toHaveLength(1);
      done();
    }, error);
  }));

  it("should update an order from a request", () => new Promise<void>(async (done, error) => {
    const order = createValidOrder();
    repository.save(order)
      .flatMap(() => service.updateOrder({
        id: order.getId().toString(),
        discountCode: "INVALID",
        shippingAddress: "Nowhere Avenue",
        status: "CREATED",
      })).run(result => {
        expect(result).toBe("Order updated. New status: CREATED");

        repository.findAll().run(orders => {
          expect(orders).toHaveLength(1);
          done();
        }, error);
      }, error);
  }));

  it("should get all orders", () => new Promise<void>((done, error) => {
    const order = createValidOrder();

    repository.save(order)
      .flatMap(() => service.getAllOrders())
      .run(orders => {
        expect(orders).toHaveLength(1);
        done();
      }, error);
  }));

  it("should complete an order", () => new Promise<void>(async (done, error) => {
    const order = createValidOrder();

    repository.save(order)
      .flatMap(() => service.completeOrder(order.getId().toString()))
      .run(result => {
        expect(result).toBe("Order with id 0 completed");
        repository.findAll().run(orders => {
          expect(orders).toHaveLength(1);
          done();
        }, error);
      }, error);
  }));

  it("should delete an order", () => new Promise<void>(async (done, error) => {
    const order = createValidOrder();

    repository.save(order)
      .flatMap(() => service.deleteOrder(order.getId().toString()))
      .run(result => {
        expect(result).toBe("Order deleted");
        repository.findAll().run(orders => {
          expect(orders).toHaveLength(0);
          done();
        }, error);
      }, error);
  }));

  it("should notify when an order is created", () => new Promise<void>((done, error) => {
    const spy = vi.spyOn(notifier, "notifyFuture");

    service.createOrder({
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 10,
        },
      ],
      discountCode: "DISCOUNT20",
      shippingAddress: "Nowhere Avenue",
    }).run(() => {
      expect(spy).toHaveBeenCalledWith("New order created: 0. Total: 8");
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    }, error);
  }));

  it("should notify when an order is completed", () => new Promise<void>(async (done, error) => {
    const order = createValidOrder();
    const spy = vi.spyOn(notifier, "notifyFuture");

    repository.save(order)
      .flatMap(() => service.completeOrder(order.getId().toString()))
      .run(() => {
        expect(spy).toHaveBeenCalledWith("Order completed: 0");
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      }, error);
  }));
});

function createValidOrder() {
  const order = Order.create(
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
