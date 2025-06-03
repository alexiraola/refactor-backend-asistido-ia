import { Future } from "../common/future";
import { Optional } from "../common/optional";
import { Order } from "../entities/order";
import { Id } from "../valueObjects/id";

export interface OrdersRepository {
  newId(): Id;
  save(order: Order): Future<void>;
  findAll(): Future<Order[]>;
  findById(id: Id): Future<Optional<Order>>;
  delete(order: Order): Promise<void>;
}

export class InMemoryOrdersRepository implements OrdersRepository {
  private orders: Order[] = [];

  newId(): Id {
    return Id.create(this.orders.length.toString());
  }

  save(order: Order): Future<void> {
    return Future.fromPromise(new Promise<void>((resolve, _reject) => {
      const index = this.orders.findIndex(o => o.equals(order));
      if (index === -1) {
        this.orders.push(order);
      } else {
        this.orders[index] = order;
      }
      resolve();
    }));
  }

  findAll(): Future<Order[]> {
    return Future.of(this.orders);
  }

  findById(id: Id): Future<Optional<Order>> {
    return Future.of(Optional.ofNullable(this.orders.find(order => order.getId().equals(id)) || null));
  }

  async delete(order: Order): Promise<void> {
    this.orders = this.orders.filter(o => !o.equals(order));
  }
}
