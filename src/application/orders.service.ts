import { Order, OrderStatus } from "../domain/entities/order";
import { DomainError } from "../domain/error";
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
  constructor(private readonly repository: OrdersRepository) { }

  async createOrder(request: CreateOrderRequest) {
    const order = Order.create(
      this.repository.newId(),
      request.items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0)),
      Discount.fromCode(request.discountCode),
      request.shippingAddress
    );
    await this.repository.save(order);
    return `Order created with total: ${order.total()}`;
  }

  async getAllOrders() {
    const orders = await this.repository.findAll();
    return orders.map(order => order.toDto());
  }

  async updateOrder(request: UpdateOrderRequest) {
    const order = await this.repository.findById(Id.create(request.id));
    if (!order) {
      throw new DomainError('Order not found');
    }

    order.update(request.discountCode, request.shippingAddress, request.status as OrderStatus);
    await this.repository.save(order);

    return `Order updated. New status: ${order.toDto().status}`;
  }

  async completeOrder(id: string) {
    const order = await this.repository.findById(Id.create(id));
    if (!order) {
      throw new DomainError('Order not found to complete');
    }

    order.complete();
    await this.repository.save(order);

    return `Order with id ${id} completed`;
  }

  async deleteOrder(id: string) {
    const order = await this.repository.findById(Id.create(id));
    if (!order) {
      throw new DomainError('Order not found');
    }
    await this.repository.delete(order);
    return 'Order deleted';
  }
}
