import { OrdersRepository } from "../domain/repositories/orders.repository";
import { ConsoleLogger, Logger, NoopLogger } from "./logger";
import { MongooseOrdersRepository } from "./mongoose.orders.repository";

export class Factory {
  static logger(): Logger {
    if (process.env.NODE_ENV === "test") {
      return new NoopLogger();
    }
    return new ConsoleLogger();
  }

  static orderRepository(): OrdersRepository {
    return new MongooseOrdersRepository();
  }
}
