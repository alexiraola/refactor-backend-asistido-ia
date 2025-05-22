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
    // Arrange
    const items = [
      OrderItem.create("1", 2, 3),
    ];

    const order = Order.create(Id.create("1"), items, Discount.fromCode("DISCOUNT20"), "Shipping address");

    // Act
    await orderRepository.create(order);

    // Assert
    const savedOrder = await orderRepository.findById(Id.create("1"));

    expect(savedOrder).toEqual(order);
  });
});
