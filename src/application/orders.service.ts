import { Order } from "../domain/entities/order";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Discount } from "../domain/valueObjects/discount";
import { OrderItem } from "../domain/valueObjects/orderItem";

export type CreateOrderRequest = {
  items: { productId: string, quantity: number, price: number }[],
  discountCode: string,
  shippingAddress: string
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
}
