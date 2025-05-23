import { OrdersRepository } from "./domain/repositories/orders.repository";
import { ConsoleLogger, Logger, NoopLogger } from "./infrastructure/logger";
import { MongooseOrdersRepository } from "./infrastructure/mongoose.orders.repository";

export class Factory {
  static logger(): Logger {
    if (process.env.NODE_ENV === "test") {
      return new NoopLogger();
    }
    return new ConsoleLogger();
  }

  static orderRepository(): OrdersRepository {
    return MongooseOrdersRepository.create(process.env.MONGODB_URL || "mongodb://root:example@localhost:27017/db_orders?authSource=admin");
  }
}
