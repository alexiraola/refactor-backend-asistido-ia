import request from 'supertest';
import dotenv from 'dotenv';
import { createServer } from '../../app';
import { Server } from 'http';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.test.env' : '.env'
});

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
    const order = {
      items: [{
        productId: '1',
        quantity: 1,
        price: 10
      }],
      shippingAddress: '123 Main St, Anytown, USA'
    };

    const response = await request(server).post("/orders").send(order);

    expect(response.status).toBe(200);
    expect(response.text).toEqual("Order created with total: 10");
  });

  it('creates an order with discount code', async () => {
    const order = {
      items: [{
        productId: '1',
        quantity: 1,
        price: 10
      }],
      discountCode: 'DISCOUNT20',
      shippingAddress: '123 Main St, Anytown, USA'
    };

    const response = await request(server).post("/orders").send(order);

    expect(response.status).toBe(200);
    expect(response.text).toEqual("Order created with total: 8");
  });
});

