import { Request, Response } from 'express';
import { OrdersService } from '../application/orders.service';
import { DomainError } from '../domain/error';
import { Logger } from '../infrastructure/logger';

export class OrdersController {
  constructor(private readonly useCase: OrdersService, private readonly logger: Logger) { }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    this.logger.log("POST /orders");
    const { items, discountCode, shippingAddress } = req.body;

    try {
      res.send((await this.useCase.createOrder({ items, discountCode, shippingAddress })));
    } catch (error: any) {
      if (error instanceof DomainError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Unexpected error");
      }
    }
  };

  getAllOrders = async (_req: Request, res: Response) => {
    this.logger.log("GET /orders");
    try {
      const orders = await this.useCase.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      if (error instanceof DomainError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Unexpected error");
      }
    }
  };

  updateOrder = async (req: Request, res: Response) => {
    this.logger.log("PUT /orders/:id");
    const { id } = req.params;
    const { status, shippingAddress, discountCode } = req.body;

    try {
      res.send((await this.useCase.updateOrder({ id, discountCode, shippingAddress, status })));
    } catch (error: any) {
      if (error instanceof DomainError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Unexpected error");
      }
    }
  };

  completeOrder = async (req: Request, res: Response) => {
    this.logger.log("POST /orders/:id/complete");
    const { id } = req.params;

    try {
      res.send((await this.useCase.completeOrder(id)));
    } catch (error: any) {
      if (error instanceof DomainError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Unexpected error");
      }
    }
  };

  deleteOrder = async (req: Request, res: Response) => {
    this.logger.log("DELETE /orders/:id");

    try {
      res.send((await this.useCase.deleteOrder(req.params.id)));
    } catch (error: any) {
      if (error instanceof DomainError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Unexpected error");
      }
    }
  };
}
