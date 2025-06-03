import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { OrderItem } from "../../domain/valueObjects/orderItem";
import { Order } from "../../domain/entities/order";
import { Id } from "../../domain/valueObjects/id";
import { Discount } from "../../domain/valueObjects/discount";
import { MongooseOrdersRepository } from "../../infrastructure/mongoose.orders.repository";
import mongoose from "mongoose";
import { Optional } from "../../domain/common/optional";
import { Future } from "../../domain/common/future";

describe("The order Mongo repository", () => {
  let orderRepository: MongooseOrdersRepository;

  beforeAll(async () => {
    const dbUrl = "mongodb://root:example@localhost:27017/db_orders_mongo_repository?authSource=admin";
    await mongoose.connect(dbUrl);
    orderRepository = new MongooseOrdersRepository();
    await mongoose.connection.dropDatabase();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it("save a given new valid order", () => new Promise<void>((done, error) => {
    const order = createValidOrder("DISCOUNT20");

    orderRepository.save(order)
      .flatMap(() => orderRepository.findByIdFuture(Id.create("1")))
      .run(async savedOrder => {
        expect(savedOrder).toEqual(Optional.some(order));
        done();
      }, error);
  }));

  it("save a given new order with an empty discount", () => new Promise<void>(async (done, error) => {
    const order = createValidOrder("INVALID");

    orderRepository.save(order)
      .flatMap(() => orderRepository.findByIdFuture(Id.create("1")))
      .run(async savedOrder => {
        expect(savedOrder).toEqual(Optional.some(order));
        done();
      }, error);
  }));

  it("updates a given order", () => new Promise<void>((done, error) => {
    const order = createValidOrder("DISCOUNT20");
    orderRepository.save(order)
      .flatMap(() => order.update("DISCOUNT30", "Shipping address 2").toFuture())
      .flatMap(() => orderRepository.save(order))
      .flatMap(() => orderRepository.findByIdFuture(Id.create("1")))
      .run((savedOrder) => {
        expect(savedOrder).toEqual(Optional.some(order));
        done();
      }, error);
  }));

  it("deletes a given order", () => new Promise<void>((done, error) => {
    const order = createValidOrder("DISCOUNT20");
    orderRepository.save(order)
      .flatMap(() => Future.fromPromise(orderRepository.delete(order)))
      .flatMap(() => orderRepository.findByIdFuture(Id.create("1")))
      .run(async savedOrder => {
        expect(savedOrder).toEqual(Optional.none());
        done();
      }, error);
  }));
});

function createValidOrder(discountCode: string): Order {
  const items = [
    OrderItem.create("1", 2, 3).get(),
  ];

  return Order.create(Id.create("1"), items, Discount.fromCode(discountCode).get(), "Shipping address").get();
}
