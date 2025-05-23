import express, { Request, Response, RequestHandler } from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrder,
  completeOrder,
  deleteOrder
} from '../controllers/orderController';
import { Factory } from '../factory';

const logger = Factory.logger();

export async function createServer(DB_URL: string, PORT: string) {
  const app = express();
  app.use(express.json());

  app.post('/orders', ((req: Request, res: Response) => createOrder(req, res)) as RequestHandler);
  app.get('/orders', ((req: Request, res: Response) => getAllOrders(req, res)) as RequestHandler);
  app.put('/orders/:id', ((req: Request, res: Response) => updateOrder(req, res)) as RequestHandler);
  app.post('/orders/:id/complete', ((req: Request, res: Response) => completeOrder(req, res)) as RequestHandler);
  app.delete('/orders/:id', ((req: Request, res: Response) => deleteOrder(req, res)) as RequestHandler);
  app.get('/', ((req: Request, res: Response) => {
    logger.log("GET /");
    res.send({ status: 'ok' });
  }) as RequestHandler);

  return app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });
}
