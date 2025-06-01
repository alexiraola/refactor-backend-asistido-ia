import { Order, OrderStatus } from "../domain/entities/order";
import { DomainError } from "../domain/error";
import { Notifier } from "../domain/notifier";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Discount } from "../domain/valueObjects/discount";
import { Id } from "../domain/valueObjects/id";
import { OrderItem } from "../domain/valueObjects/orderItem";

export type CreateOrderRequest = {
  items: { productId: string, quantity: number, price: number }[],
  discountCode: string,
  shippingAddress: string
};

export type UpdateOrderRequest = {
  id: string,
  discountCode: string,
  shippingAddress: string,
  status: string
};

export class OrdersService {
  constructor(private readonly repository: OrdersRepository, private readonly notifier: Notifier) { }

  async createOrder(request: CreateOrderRequest) {
    const order = Order.createResult(
      this.repository.newId(),
      request.items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0).get()),
      Discount.fromCode(request.discountCode).get(),
      request.shippingAddress
    ).get();
    await this.repository.save(order);
    await this.notifier.notify(`New order created: ${order.toDto()._id}. Total: ${order.total()}`);
    return `Order created with total: ${order.total()}`;
  }

  async getAllOrders() {
    const orders = await this.repository.findAll();
    return orders.map(orders => orders.map(order => order.toDto()));
  }

  async updateOrder(request: UpdateOrderRequest) {
    const order = await this.repository.findById(Id.create(request.id));

    return order.match(async order => {
      order.update(request.discountCode, request.shippingAddress, request.status as OrderStatus);
      await this.repository.save(order);

      await this.notifier.notify(`Order updated. New status: ${order.toDto().status}`);

      return `Order updated. New status: ${order.toDto().status}`;
    }, () => {
      throw new DomainError('Order not found');
    });
  }

  async completeOrder(id: string) {
    const order = await this.repository.findById(Id.create(id));

    return order.match(async order => {
      order.complete();
      await this.repository.save(order);

      await this.notifier.notify(`Order completed: ${order.toDto()._id}`);

      return `Order with id ${id} completed`;
    }, () => {
      throw new DomainError('Order not found to complete');
    });
  }

  async deleteOrder(id: string) {
    const order = await this.repository.findById(Id.create(id));

    return order.match(async order => {
      await this.repository.delete(order);

      await this.notifier.notify(`Order deleted: ${order.toDto()._id}`);

      return 'Order deleted';
    }, () => {
      throw new DomainError('Order not found');
    });
  }
}
