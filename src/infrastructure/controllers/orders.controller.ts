import { Request, Response } from 'express';
import { OrdersService } from '../../application/orders.service';
import { DomainError } from '../../domain/error';
import { Logger } from '../logger';

export class OrdersController {
  constructor(private readonly useCase: OrdersService, private readonly logger: Logger) { }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    this.logger.log("POST /orders");
    const { items, discountCode, shippingAddress } = req.body;

    this.useCase.createOrder({ items, discountCode, shippingAddress }).run(
      message => res.send(message),
      error => {
        if (error instanceof DomainError) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("Unexpected error");
        }
      }
    );
  };

  getAllOrders = (_req: Request, res: Response) => {
    this.logger.log("GET /orders");

    this.useCase.getAllOrders().run(
      orders => res.json(orders),
      error => {
        if (error instanceof DomainError) {
          return res.status(400).send(error.message);
        } else {
          return res.status(500).send("Unexpected error");
        }
      }
    );
  };

  updateOrder = (req: Request, res: Response) => {
    this.logger.log("PUT /orders/:id");
    const { id } = req.params;
    const { status, shippingAddress, discountCode } = req.body;

    this.useCase.updateOrder({ id, status, shippingAddress, discountCode }).run(
      message => res.send(message),
      error => {
        if (error instanceof DomainError) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("Unexpected error");
        }
      }
    );
  };

  completeOrder = (req: Request, res: Response) => {
    this.logger.log("POST /orders/:id/complete");
    const { id } = req.params;

    this.useCase.completeOrder(id).run(
      message => res.send(message),
      error => {
        if (error instanceof DomainError) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("Unexpected error");
        }
      }
    )
  };

  deleteOrder = (req: Request, res: Response) => {
    this.logger.log("DELETE /orders/:id");

    this.useCase.deleteOrder(req.params.id).run(
      message => res.send(message),
      error => {
        if (error instanceof DomainError) {
          res.status(400).send(error.message);
        } else {
          res.status(500).send("Unexpected error");
        }
      }
    )
  };
}
