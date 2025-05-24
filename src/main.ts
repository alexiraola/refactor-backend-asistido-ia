import dotenv from 'dotenv';
import { createServer } from './infrastructure/server';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.test.env' : '.env'
});

const DB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/db_orders";
const PORT = process.env.PORT || "3001";

createServer(DB_URL, PORT);
