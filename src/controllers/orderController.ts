import { Request, Response } from 'express';
import { Id } from '../domain/valueObjects/id';
import { Factory } from '../factory';
import { OrdersService } from '../application/orders.service';

const repository = Factory.getOrderRepository();
const logger = Factory.logger();

// Create a new order
export const createOrder = async (useCase: OrdersService, req: Request, res: Response) => {
  logger.log("POST /orders");
  const { items, discountCode, shippingAddress } = req.body;

  try {
    const result = await useCase.createOrder({ items, discountCode, shippingAddress });
    res.send(result);
  } catch (error: any) {
    return res.status(400).send(error.message);
  }
};

// Get all orders
export const getAllOrders = async (useCase: OrdersService, _req: Request, res: Response) => {
  logger.log("GET /orders");
  const orders = await useCase.getAllOrders();
  res.json(orders);
};

// Update order
export const updateOrder = async (req: Request, res: Response) => {
  logger.log("PUT /orders/:id");
  const { id } = req.params;
  const { status, shippingAddress, discountCode } = req.body;

  const order2 = await repository.findById(Id.create(id));
  if (!order2) {
    return res.status(400).send('Order not found');
  }

  order2.update(discountCode, shippingAddress, status);

  await repository.save(order2);
  res.send(`Order updated. New status: ${order2.toDto().status}`);
};

// Complete order
export const completeOrder = async (req: Request, res: Response) => {
  logger.log("POST /orders/:id/complete");
  const { id } = req.params;

  const order = await repository.findById(Id.create(id));
  if (!order) {
    return res.status(400).send('Order not found to complete');
  }

  try {
    order.complete();
    await repository.save(order);
  } catch (error: any) {
    logger.error(error);
    return res.status(400).send(error.message);
  }

  res.send(`Order with id ${id} completed`);
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
  logger.log("DELETE /orders/:id");
  const order = await repository.findById(Id.create(req.params.id));
  if (order === null) {
    res.status(400).send('Order not found');
  } else {
    await repository.delete(order);
    res.send('Order deleted');
  }
};
