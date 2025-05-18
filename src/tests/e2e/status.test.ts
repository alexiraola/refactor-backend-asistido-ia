import request from 'supertest';
import dotenv from 'dotenv';
import { createServer } from '../../app';
import { Server } from 'http';
import mongoose from 'mongoose';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.test.env' : '.env'
});

describe("Orders API", () => {
  describe('Status endpoint', () => {
    let server: Server;

    beforeAll(() => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = createServer(DB_URL, PORT);
    });

    afterAll(() => {
      server.close();
    });

    it('checks API health', async () => {
      const response = await request(server).get("/");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe("POST /orders", () => {
    let server: Server;

    beforeAll(() => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = createServer(DB_URL, PORT);
    });

    afterAll(() => {
      server.close();
    });

    it('should create an order', async () => {
      const response = await createValidOrder(server);

      expect(response.status).toBe(200);
      expect(response.text).toEqual("Order created with total: 10");
    });

    it('creates an order with discount code', async () => {
      const response = await createValidOrder(server, 'DISCOUNT20');

      expect(response.status).toBe(200);
      expect(response.text).toEqual("Order created with total: 8");
    });

    it('does not create an order without items', async () => {
      const order = {
        items: [],
        shippingAddress: '123 Main St, Anytown, USA'
      };

      const response = await request(server).post("/orders").send(order);

      expect(response.status).toBe(400);
      expect(response.text).toEqual("The order must have at least one item");
    });
  });

  describe('GET /orders', () => {
    let server: Server;

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = createServer(DB_URL, PORT);
      await mongoose.connection.dropDatabase();
    });

    afterEach(async () => {
      await mongoose.connection.dropDatabase();
    });

    afterAll(() => {
      server.close();
    });

    it('should get empty array when no orders exist', async () => {
      const response = await request(server).get("/orders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should get all orders', async () => {
      await createValidOrder(server);
      await createValidOrder(server);

      const response = await request(server).get("/orders");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('DELETE /orders/:id', () => {
    let server: Server;

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = createServer(DB_URL, PORT);
      await mongoose.connection.dropDatabase();
    });

    afterEach(async () => {
      await mongoose.connection.dropDatabase();
    });

    afterAll(() => {
      server.close();
    });

    it('should delete an order', async () => {
      await createValidOrder(server);

      const response = await request(server).get("/orders");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      const deleteResponse = await request(server).delete("/orders/" + response.body[0]._id);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.text).toEqual("Order deleted");

      const afterDeleteResponse = await request(server).get("/orders");

      expect(afterDeleteResponse.status).toBe(200);
      expect(afterDeleteResponse.body.length).toBe(0);
    });

    it('returns an error when trying to delete an order that does not exist', async () => {
      const deleteResponse = await request(server).delete("/orders/123");

      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.text).toEqual("Order not found");
    });
  });
});

function createValidOrder(server: Server, discountCode?: string) {
  const order = {
    items: [{
      productId: '1',
      quantity: 1,
      price: 10
    }],
    shippingAddress: '123 Main St, Anytown, USA',
    discountCode
  };

  return request(server).post("/orders").send(order);
}
