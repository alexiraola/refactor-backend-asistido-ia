import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import { createServer } from '../../infrastructure/server';
import { Server } from 'http';
import mongoose from 'mongoose';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.test.env' : '.env'
});

describe("Orders API", () => {
  describe('Status endpoint', () => {
    let server: Server;

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = await createServer(DB_URL, PORT);
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

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = await createServer(DB_URL, PORT);
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
      server = await createServer(DB_URL, PORT);
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
      server = await createServer(DB_URL, PORT);
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
      const order = await getFirstOrder(server);

      const deleteResponse = await request(server).delete("/orders/" + order._id);
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
  describe('POST /orders/:id/complete', () => {
    let server: Server;

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = await createServer(DB_URL, PORT);
      await mongoose.connection.dropDatabase();
    });

    afterEach(async () => {
      await mongoose.connection.dropDatabase();
    });

    afterAll(() => {
      server.close();
    });

    it('completes an order', async () => {
      await createValidOrder(server);
      const order = await getFirstOrder(server);

      const completeResponse = await request(server).post("/orders/" + order._id + "/complete");

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.text).toEqual("Order with id " + order._id + " completed");
    });

    it('does not allow completing an order that is not created', async () => {
      const response = await request(server).post("/orders/123/complete");

      expect(response.status).toBe(400);
      expect(response.text).toEqual("Order not found to complete");
    });

    it('does not allow completing an order with status other than CREATED', async () => {
      await createValidOrder(server);
      const order = await getFirstOrder(server);

      await request(server).post("/orders/" + order._id + "/complete");
      const completeResponse = await request(server).post("/orders/" + order._id + "/complete");

      expect(completeResponse.status).toBe(400);
      expect(completeResponse.text).toEqual("Cannot complete an order with status: COMPLETED");
    });
  });

  describe('PUT /orders/:id', () => {
    let server: Server;

    beforeAll(async () => {
      const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
      const PORT = process.env.PORT || "3001";
      server = await createServer(DB_URL, PORT);
      await mongoose.connection.dropDatabase();
    });

    afterEach(async () => {
      await mongoose.connection.dropDatabase();
    });

    afterAll(() => {
      server.close();
    });

    it('updates an order', async () => {
      await createValidOrder(server);
      const order = await getFirstOrder(server);

      const updateResponse = await request(server).put("/orders/" + order._id).send({
        status: 'COMPLETED',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.text).toEqual("Order updated. New status: COMPLETED");
    });

    it('does not allow to update a non-existing order', async () => {
      const updateResponse = await request(server).put("/orders/123").send({
        status: 'COMPLETED',
      });

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.text).toEqual("Order not found");
    });

    it('updates an order with shipping address', async () => {
      await createValidOrder(server);
      const order = await getFirstOrder(server);

      const updateResponse = await request(server).put("/orders/" + order._id).send({
        shippingAddress: '123 Main St, Anytown, USA',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.text).toEqual("Order updated. New status: CREATED");
    });

    it('updates and order with discount code', async () => {
      await createValidOrder(server);
      const order = await getFirstOrder(server);

      const updateResponse = await request(server).put("/orders/" + order._id).send({
        discountCode: 'DISCOUNT20',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.text).toEqual("Order updated. New status: CREATED");
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

async function getFirstOrder(server: Server) {
  const response = await request(server).get('/orders');
  return response.body[0];
}
