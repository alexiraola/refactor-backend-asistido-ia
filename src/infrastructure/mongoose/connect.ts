import mongoose from 'mongoose';
import { Logger } from '../logger';

export async function connectToMongo(uri: string, logger: Logger): Promise<void> {
  await mongoose.connect(uri);
  logger.log('✅ Connected to MongoDB');
}
