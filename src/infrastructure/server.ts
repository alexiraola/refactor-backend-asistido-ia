import express, { Request, Response } from 'express';
import {
  OrdersController
} from '../controllers/orderController';
import { Factory } from '../factory';
import { connectToMongo } from './mongoose/connect';

const logger = Factory.logger();

export async function createServer(DB_URL: string, PORT: string) {
  await connectToMongo(DB_URL, logger);

  const useCase = Factory.createOrderService();
  const controller = new OrdersController(useCase, logger);

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
}
