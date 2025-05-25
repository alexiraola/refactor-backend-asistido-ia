import { Request, Response } from 'express';
import { Factory } from '../factory';
import { OrdersService } from '../application/orders.service';
import { DomainError } from '../domain/error';

const logger = Factory.logger();

// Create a new order
export const createOrder = async (useCase: OrdersService, req: Request, res: Response) => {
  logger.log("POST /orders");
  const { items, discountCode, shippingAddress } = req.body;

  try {
    const result = await useCase.createOrder({ items, discountCode, shippingAddress });
    res.send(result);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Unexpected error");
  }
};

// Get all orders
export const getAllOrders = async (useCase: OrdersService, _req: Request, res: Response) => {
  logger.log("GET /orders");
  try {
    const orders = await useCase.getAllOrders();
    res.json(orders);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Unexpected error");
  }
};

// Update order
export const updateOrder = async (useCase: OrdersService, req: Request, res: Response) => {
  logger.log("PUT /orders/:id");
  const { id } = req.params;
  const { status, shippingAddress, discountCode } = req.body;

  try {
    res.send((await useCase.updateOrder({ id, discountCode, shippingAddress, status })));
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Unexpected error");
  }
};

// Complete order
export const completeOrder = async (useCase: OrdersService, req: Request, res: Response) => {
  logger.log("POST /orders/:id/complete");
  const { id } = req.params;

  try {
    res.send((await useCase.completeOrder(id)));
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Unexpected error");
  }
};

// Delete order
export const deleteOrder = async (useCase: OrdersService, req: Request, res: Response) => {
  logger.log("DELETE /orders/:id");

  try {
    res.send((await useCase.deleteOrder(req.params.id)));
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.status(400).send(error.message);
    }
    return res.status(500).send("Unexpected error");
  }
};
