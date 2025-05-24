import { Request, Response } from 'express';
import { Discount } from '../domain/valueObjects/discount';
import { OrderItem } from '../domain/valueObjects/orderItem';
import { Order } from '../domain/entities/order';
import { Id } from '../domain/valueObjects/id';
import { Factory } from '../factory';

const repository = Factory.orderRepository();
const logger = Factory.logger();

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  logger.log("POST /orders");
  const { items, discountCode, shippingAddress } = req.body;

  try {
    const order = Order.create(
      repository.newId(),
      items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0)),
      Discount.fromCode(discountCode),
      shippingAddress
    );
    await repository.save(order);

    res.send(`Order created with total: ${order.total()}`);
  } catch (error: any) {
    return res.status(400).send(error.message);
  }
};

// Get all orders
export const getAllOrders = async (_req: Request, res: Response) => {
  logger.log("GET /orders");
  const orders = await repository.findAll();
  res.json(orders.map(order => order.toDto()));
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
