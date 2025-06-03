import { Future } from "../domain/common/future";
import { Result } from "../domain/common/result";
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

  createOrder(request: CreateOrderRequest) {
    return Order.create(
      this.repository.newId(),
      request.items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0).get()),
      Discount.fromCode(request.discountCode).get(),
      request.shippingAddress
    ).toFuture()
      .flatMap(order => this.repository.saveFuture(order)
        .flatMap(() => Future.fromPromise(this.notifier.notify(`New order created: ${order.toDto()._id}. Total: ${order.total()}`)))
        .map(() => `Order created with total: ${order.total()}`));
  }

  getAllOrders() {
    return this.repository.findAll().map(orders => orders.map(order => order.toDto()));
  }

  updateOrder(request: UpdateOrderRequest) {
    return Future.fromPromise(this.repository.findById(Id.create(request.id)))
      .flatMap(orderOptional => Result.fromOptional(orderOptional, new DomainError('Order not found')).toFuture())
      .flatMap(order =>
        order.update(request.discountCode, request.shippingAddress, request.status as OrderStatus).toFuture()
          .flatMap(() => this.repository.saveFuture(order))
          .flatMap(() => Future.fromPromise(this.notifier.notify(`Order updated. New status: ${order.toDto().status}`))
            .map(() => `Order updated. New status: ${order.toDto().status}`))
      );
  }

  completeOrder(id: string) {
    return Future.fromPromise(this.repository.findById(Id.create(id)))
      .flatMap(orderOptional => Result.fromOptional(orderOptional, new DomainError('Order not found to complete')).toFuture())
      .flatMap(order => order.complete().toFuture()
        .flatMap(() => this.repository.saveFuture(order))
        .flatMap(() => Future.fromPromise(this.notifier.notify(`Order completed: ${order.toDto()._id}`))
          .map(() => `Order with id ${id} completed`))
      );
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
