import { OrdersService } from "./application/orders.service";
import { Notifier } from "./domain/notifier";
import { OrdersRepository } from "./domain/repositories/orders.repository";
import { ConsoleLogger, Logger } from "./infrastructure/logger";
import { MongooseOrdersRepository } from "./infrastructure/mongoose.orders.repository";
import { SendGridNotifier } from "./infrastructure/sendgrid.notifier";

export class Factory {
  private static orderRepository: OrdersRepository;

  static logger(): Logger {
    return new ConsoleLogger();
  }

  static getOrderRepository(): OrdersRepository {
    if (!Factory.orderRepository) {
      this.orderRepository = new MongooseOrdersRepository();
    }
    return this.orderRepository;
  }

  static getNotifier(): Notifier {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not defined");
    }
    return new SendGridNotifier(process.env.SENDGRID_API_KEY);
  }

  static createOrderService(): OrdersService {
    const repository = this.getOrderRepository();
    return new OrdersService(repository, this.getNotifier());
  }
}
