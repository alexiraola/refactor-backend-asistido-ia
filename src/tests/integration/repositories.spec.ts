import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { OrderItem } from "../../domain/valueObjects/orderItem";
import { Order } from "../../domain/entities/order";
import { Id } from "../../domain/valueObjects/id";
import { Discount } from "../../domain/valueObjects/discount";
import { MongooseOrdersRepository } from "../../infrastructure/mongoose.orders.repository";
import mongoose from "mongoose";

describe("The order Mongo repository", () => {
  let orderRepository: MongooseOrdersRepository;

  beforeAll(async () => {
    const dbUrl = "mongodb://root:example@localhost:27017/db_orders_mongo_repository?authSource=admin";
    orderRepository = MongooseOrdersRepository.create(dbUrl);
    await mongoose.connection.dropDatabase();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it("save a given new valid order", async () => {
    const order = createValidOrder("DISCOUNT20");

    await orderRepository.save(order);

    const savedOrder = await orderRepository.findById(Id.create("1"));
    expect(savedOrder).toEqual(order);
  });

  it("save a given new order with an empty discount", async () => {
    const order = createValidOrder("INVALID");

    await orderRepository.save(order);

    const savedOrder = await orderRepository.findById(Id.create("1"));
    expect(savedOrder).toEqual(order);
  });

  it("updates a given order", async () => {
    const order = createValidOrder("DISCOUNT20");
    await orderRepository.save(order);

    order.update("DISCOUNT30", "Shipping address 2");
    await orderRepository.save(order);

    const savedOrder = await orderRepository.findById(Id.create("1"));
    expect(savedOrder).toEqual(order);
  });

  it("deletes a given order", async () => {
    const order = createValidOrder("DISCOUNT20");
    await orderRepository.save(order);

    await orderRepository.delete(order);

    const savedOrder = await orderRepository.findById(Id.create("1"));
    expect(savedOrder).toBeNull();
  });
});

function createValidOrder(discountCode: string): Order {
  const items = [
    OrderItem.create("1", 2, 3),
  ];

  return Order.create(Id.create("1"), items, Discount.fromCode(discountCode), "Shipping address");
}
