import { Order, OrderStatus } from "../domain/entities/order";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Discount } from "../domain/valueObjects/discount";
import { Id } from "../domain/valueObjects/id";
import { OrderItem } from "../domain/valueObjects/orderItem";
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrder extends Document {
  _id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  status: string;
  discountCode?: string;
  shippingAddress: string;
  total?: number;
}

const OrderSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  items: [
    {
      productId: { type: String },
      quantity: { type: Number },
      price: { type: Number },
    },
  ],
  status: { type: String, default: 'CREATED' },
  discountCode: { type: String, required: false },
  shippingAddress: { type: String },
  total: { type: Number, default: 0 },
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);

function isValidStatus(status: string): status is OrderStatus {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

export class MongooseOrdersRepository implements OrdersRepository {
  newId(): Id {
    return Id.create(new mongoose.Types.ObjectId().toString());
  }

  async create(order: Order): Promise<void> {
    const orderModel = new OrderModel(order.toDto());
    await orderModel.save();
  }

  async update(order: Order): Promise<void> {
    const { _id, ...data } = order.toDto();
    await OrderModel.findByIdAndUpdate(_id, data, { new: true });
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.find();
    return orders.map((order) => {
      return Order.create(
        Id.create(order._id),
        order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price)),
        Discount.fromCode(order.discountCode || ""),
        order.shippingAddress,
        isValidStatus(order.status) ? order.status : undefined
      );
    });
  }

  async findById(id: Id): Promise<Order | null> {
    const order = await OrderModel.findById(id.toString());

    if (!order) {
      return null;
    }

    return Order.create(
      Id.create(order._id),
      order.items.map((item) => OrderItem.create(item.productId, item.quantity, item.price)),
      Discount.fromCode(order.discountCode || ""),
      order.shippingAddress,
      isValidStatus(order.status) ? order.status : undefined
    );
  }

  async delete(order: Order): Promise<void> {
    await OrderModel.findByIdAndDelete(order.toDto()._id);
  }
}
