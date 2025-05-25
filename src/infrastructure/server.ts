import express, { Request, Response, RequestHandler } from 'express';
import {
  getAllOrders,
  updateOrder,
  completeOrder,
  deleteOrder,
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
  app.post('/orders', ((req: Request, res: Response) => controller.createOrder(req, res)) as RequestHandler);
  app.get('/orders', ((req: Request, res: Response) => getAllOrders(useCase, req, res)) as RequestHandler);
  app.put('/orders/:id', ((req: Request, res: Response) => updateOrder(useCase, req, res)) as RequestHandler);
  app.post('/orders/:id/complete', ((req: Request, res: Response) => completeOrder(useCase, req, res)) as RequestHandler);
  app.delete('/orders/:id', ((req: Request, res: Response) => deleteOrder(useCase, req, res)) as RequestHandler);
  app.get('/', ((_req: Request, res: Response) => {
    logger.log("GET /");
    res.send({ status: 'ok' });
  }) as RequestHandler);

  return app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });
}
