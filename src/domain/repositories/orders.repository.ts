import { Order } from "../entities/order";
import { Id } from "../valueObjects/id";

export interface OrdersRepository {
  newId(): Id;
  create(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  findAll(): Promise<Order[]>;
  findById(id: Id): Promise<Order | null>;
  delete(order: Order): Promise<void>;
}
