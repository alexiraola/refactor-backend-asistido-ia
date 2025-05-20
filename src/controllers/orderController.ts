import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { Discount } from '../domain/valueObjects/discount';
import { OrderItem } from '../domain/valueObjects/orderItem';
import { Order } from '../domain/entities/order';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  console.log("POST /orders");
  const { items, discountCode, shippingAddress } = req.body;

  try {
    const order = Order.create(
      items.map((item: any) => OrderItem.create(item.productId, item.quantity || 0, item.price || 0)),
      Discount.fromCode(discountCode),
      shippingAddress
    );
    const newOrder = new OrderModel(order.toDto());

    await newOrder.save();
    res.send(`Order created with total: ${order.total()}`);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

// Get all orders
export const getAllOrders = async (_req: Request, res: Response) => {
  console.log("GET /orders");
  const orders = await OrderModel.find();
  res.json(orders);
};

// Update order
export const updateOrder = async (req: Request, res: Response) => {
  console.log("PUT /orders/:id");
  const { id } = req.params;
  const { status, shippingAddress, discountCode } = req.body;

  const order = await OrderModel.findById(id);
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

  const order = await OrderModel.findById(id);
  if (!order) {
    return res.status(400).send('Order not found to complete');
  }

  if (order.status !== 'CREATED') {
    return res.status(400).send(`Cannot complete an order with status: ${order.status}`);
  }

  order.status = 'COMPLETED';
  await order.save();
  res.send(`Order with id ${id} completed`);
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
  console.log("DELETE /orders/:id");
  const order = await OrderModel.findByIdAndDelete(req.params.id);
  console.log(order);
  if (order === null) {
    res.status(400).send('Order not found');
  } else {
    res.send('Order deleted');
  }
};
