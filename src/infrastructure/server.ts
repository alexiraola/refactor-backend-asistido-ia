import express, { Request, Response } from 'express';
import {
  OrdersController
} from './controllers/orders.controller';
import { Factory } from '../factory';
import { connectToMongo } from './mongoose/connect';

export async function createServer(DB_URL: string, PORT: string) {
  try {
    const logger = Factory.logger();
    const controller = new OrdersController((Factory.createOrderService()), logger);

    await connectToMongo(DB_URL, logger);

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

    return app.listen(PORT, () => {
      logger.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
