import { Optional } from "../common/optional";
import { Result } from "../common/result";
import { Order } from "../entities/order";
import { Id } from "../valueObjects/id";

export interface OrdersRepository {
  newId(): Id;
  save(order: Order): Promise<void>;
  findAll(): Promise<Result<Order[], Error>>;
  findById(id: Id): Promise<Optional<Order>>;
  delete(order: Order): Promise<void>;
}

export class InMemoryOrdersRepository implements OrdersRepository {
  private orders: Order[] = [];

  newId(): Id {
    return Id.create(this.orders.length.toString());
  }

  async save(order: Order): Promise<void> {
    const index = this.orders.findIndex(o => o.equals(order));
    if (index === -1) {
      this.orders.push(order);
    } else {
      this.orders[index] = order;
    }
  }

  async findAll(): Promise<Result<Order[], Error>> {
    return Result.ok(this.orders);
  }

  async findById(id: Id): Promise<Optional<Order>> {
    return Optional.ofNullable(this.orders.find(order => order.getId().equals(id)) || null);
  }

  async delete(order: Order): Promise<void> {
    this.orders = this.orders.filter(o => !o.equals(order));
  }
}
