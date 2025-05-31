import { Order, OrderStatus } from "../domain/entities/order";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Discount } from "../domain/valueObjects/discount";
import { Id } from "../domain/valueObjects/id";
import { OrderItem } from "../domain/valueObjects/orderItem";
import mongoose from 'mongoose';
import { OrderModel } from "./mongoose/order.model";
import { Optional } from "../domain/common/optional";
import { Result } from "../domain/common/result";

function isValidStatus(status: string): status is OrderStatus {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

export class MongooseOrdersRepository implements OrdersRepository {
  newId(): Id {
    return Id.create(new mongoose.Types.ObjectId().toString());
  }

  async save(order: Order): Promise<void> {
    const { _id, ...data } = order.toDto();
    await OrderModel.findByIdAndUpdate(_id, data, { upsert: true });
  }

  async findAll(): Promise<Result<Order[], Error>> {
    const orders = await OrderModel.find();
    return Result.ok(orders.map((order) => {
      return Order.create(
        Id.create(order._id),
        order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price)),
        Discount.fromCode(order.discountCode || ""),
        order.shippingAddress,
        isValidStatus(order.status) ? order.status : undefined
      );
    }));
  }

  async findById(id: Id): Promise<Optional<Order>> {
    const order = await OrderModel.findById(id.toString());

    if (!order) {
      return Optional.none();
    }

    return Optional.some(Order.create(
      Id.create(order._id),
      order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price)),
      Discount.fromCode(order.discountCode || ""),
      order.shippingAddress,
      isValidStatus(order.status) ? order.status : undefined
    ));
  }

  async delete(order: Order): Promise<void> {
    await OrderModel.findByIdAndDelete(order.toDto()._id);
  }
}
