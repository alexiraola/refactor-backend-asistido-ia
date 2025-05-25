import mongoose from 'mongoose';
import { Logger } from '../logger';

export async function connectToMongo(uri: string, logger: Logger): Promise<void> {
  try {
    await mongoose.connect(uri);
    logger.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  }
}
