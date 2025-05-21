import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { Discount } from '../domain/valueObjects/discount';
import { OrderItem } from '../domain/valueObjects/orderItem';
import { Order } from '../domain/entities/order';
import { MongooseOrdersRepository } from '../infrastructure/mongoose.orders.repository';
import { Id } from '../domain/valueObjects/id';

const repository = new MongooseOrdersRepository();

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  console.log("POST /orders");
  const { items, discountCode, shippingAddress } = req.body;

  try {
    const order = Order.create(
      Id.create(),
      items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0)),
      Discount.fromCode(discountCode),
      shippingAddress
    );
    await repository.create(order);

    res.send(`Order created with total: ${order.total()}`);
  } catch (error: any) {
    return res.status(400).send(error.message);
  }
};

// Get all orders
export const getAllOrders = async (_req: Request, res: Response) => {
  console.log("GET /orders");
  const orders = await repository.findAll();
  res.json(orders.map(order => order.toDto()));
};

// Update order
export const updateOrder = async (req: Request, res: Response) => {
  console.log("PUT /orders/:id");
  const { id } = req.params;
  const { status, shippingAddress, discountCode } = req.body;

  const order2 = await repository.findById(Id.create(id));
  if (!order2) {
    return res.status(400).send('Order not found');
  }

  const order = await OrderModel.findById(id)!;

  if (!order) {
    return res.status(400).send('Order not found');
  }

  if (shippingAddress) {
    order.shippingAddress = shippingAddress;
  }

  if (status) {
    if (status === 'COMPLETED' && order.items.length === 0) {
      return res.send('Cannot complete an order without items');
    }
    order.status = status;
  }

  if (discountCode) {
    order.discountCode = discountCode;
    if (discountCode === 'DISCOUNT20') {
      const discount = Discount.fromCode(discountCode);
      order.total = discount.apply(order.total || 0);
    } else {
      console.log('Invalid or not implemented discount code');
    }
  }

  await order.save();
  res.send(`Order updated. New status: ${order.status}`);
};

// Complete order
export const completeOrder = async (req: Request, res: Response) => {
  console.log("POST /orders/:id/complete");
  const { id } = req.params;

  const order = await repository.findById(Id.create(id));
  if (!order) {
    return res.status(400).send('Order not found to complete');
  }

  try {
    order.complete();
    await repository.update(order);
  } catch (error: any) {
    console.error(error);
    return res.status(400).send(error.message);
  }

  res.send(`Order with id ${id} completed`);
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
  console.log("DELETE /orders/:id");
  const order = await repository.findById(Id.create(req.params.id));
  if (order === null) {
    res.status(400).send('Order not found');
  } else {
    await repository.delete(order);
    res.send('Order deleted');
  }
};
