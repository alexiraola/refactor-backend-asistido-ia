import { OrdersService } from "./application/orders.service";
import { OrdersRepository } from "./domain/repositories/orders.repository";
import { ConsoleLogger, Logger, NoopLogger } from "./infrastructure/logger";
import { MongooseOrdersRepository } from "./infrastructure/mongoose.orders.repository";

export class Factory {
  private static orderRepository: OrdersRepository;

  static logger(): Logger {
    if (process.env.NODE_ENV === "test") {
      return new NoopLogger();
    }
    return new ConsoleLogger();
  }

  static getOrderRepository(): OrdersRepository {
    if (!Factory.orderRepository) {
      this.orderRepository = new MongooseOrdersRepository();
    }
    return this.orderRepository;
  }

  static createOrderService(): OrdersService {
    const repository = this.getOrderRepository();
    return new OrdersService(repository);
  }
}
