import { Order, OrderStatus } from "../domain/entities/order";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Discount } from "../domain/valueObjects/discount";
import { Id } from "../domain/valueObjects/id";
import { OrderItem } from "../domain/valueObjects/orderItem";
import mongoose from 'mongoose';
import { OrderModel } from "./mongoose/order.model";
import { Optional } from "../domain/common/optional";
import { Future } from "../domain/common/future";

function isValidStatus(status: string): status is OrderStatus {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

export class MongooseOrdersRepository implements OrdersRepository {
  newId(): Id {
    return Id.create(new mongoose.Types.ObjectId().toString());
  }

  saveFuture(order: Order): Future<void> {
    const { _id, ...data } = order.toDto();
    return Future.fromPromise(OrderModel.findByIdAndUpdate(_id, data, { upsert: true })).map(() => { });
  }

  findAll(): Future<Order[]> {
    return Future.fromPromise(OrderModel.find()).map(orders => orders.map((order) => {
      return Order.create(
        Id.create(order._id),
        order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price).get()),
        Discount.fromCode(order.discountCode || "").get(),
        order.shippingAddress,
        isValidStatus(order.status) ? order.status : undefined
      ).get();
    }));
  }

  async findById(id: Id): Promise<Optional<Order>> {
    const order = await OrderModel.findById(id.toString());

    if (!order) {
      return Optional.none();
    }

    return Optional.some(Order.create(
      Id.create(order._id),
      order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price).get()),
      Discount.fromCode(order.discountCode || "").get(),
      order.shippingAddress,
      isValidStatus(order.status) ? order.status : undefined
    ).get());
  }

  async delete(order: Order): Promise<void> {
    await OrderModel.findByIdAndDelete(order.toDto()._id);
  }
}
