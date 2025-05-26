import { Order } from "../entities/order";
import { Id } from "../valueObjects/id";

export interface OrdersRepository {
  newId(): Id;
  save(order: Order): Promise<void>;
  findAll(): Promise<Order[]>;
  findById(id: Id): Promise<Order | null>;
  delete(order: Order): Promise<void>;
}

export class InMemoryOrdersRepository implements OrdersRepository {
  private orders: Order[] = [];

  newId(): Id {
    return Id.create(this.orders.length.toString());
  }

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orders;
  }

  async findById(id: Id): Promise<Order | null> {
    return this.orders.find(order => order.getId().equals(id)) || null;
  }

  async delete(order: Order): Promise<void> {
    this.orders = this.orders.filter(o => o.equals(order));
  }
}
