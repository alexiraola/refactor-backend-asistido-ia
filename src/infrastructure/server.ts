import express, { Request, Response } from 'express';
import {
  OrdersController
} from './controllers/orders.controller';
import { Factory } from '../factory';
import { connectToMongo } from './mongoose/connect';

export async function createServer(dbUrl: string, port: string, logger = Factory.logger(), orderService = Factory.createOrderService()) {
  try {
    const controller = new OrdersController(orderService, logger);

    await connectToMongo(dbUrl, logger);

    const app = express();
    app.use(express.json());
    app.post('/orders', controller.createOrder);
    app.get('/orders', controller.getAllOrders);
    app.put('/orders/:id', controller.updateOrder);
    app.post('/orders/:id/complete', controller.completeOrder);
    app.delete('/orders/:id', controller.deleteOrder);
    app.get('/', ((_req: Request, res: Response) => {
      logger.log("GET /");
      res.send({ status: 'ok' });
    }));

    return app.listen(port, () => {
      logger.log(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
