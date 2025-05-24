import { Order } from "../entities/order";
import { Id } from "../valueObjects/id";

export interface OrdersRepository {
  newId(): Id;
  save(order: Order): Promise<void>;
  findAll(): Promise<Order[]>;
  findById(id: Id): Promise<Order | null>;
  delete(order: Order): Promise<void>;
}
