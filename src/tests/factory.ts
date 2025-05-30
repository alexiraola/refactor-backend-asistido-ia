import { OrdersService } from "../application/orders.service";
import { Notifier } from "../domain/notifier";
import { OrdersRepository } from "../domain/repositories/orders.repository";
import { Logger, NoopLogger } from "../infrastructure/logger";
import { MongooseOrdersRepository } from "../infrastructure/mongoose.orders.repository";

export class FakeNotifier implements Notifier {
  async notify(_message: string) {
  }
}

export class TestFactory {
  private static orderRepository: OrdersRepository;

  static logger(): Logger {
    return new NoopLogger();
  }

  static getOrderRepository(): OrdersRepository {
    if (!this.orderRepository) {
      this.orderRepository = new MongooseOrdersRepository();
    }
    return this.orderRepository;
  }

  static getNotifier(): Notifier {
    return new FakeNotifier();
  }

  static createOrderService(): OrdersService {
    const repository = this.getOrderRepository();
    return new OrdersService(repository, this.getNotifier());
  }
}
