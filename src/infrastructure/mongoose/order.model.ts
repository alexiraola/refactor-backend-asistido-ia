import mongoose, { Schema } from "mongoose";

interface IOrder extends Document {
  _id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  status: string;
  discountCode?: string;
  shippingAddress: string;
  total?: number;
}

const OrderSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  items: [
    {
      productId: { type: String },
      quantity: { type: Number },
      price: { type: Number },
    },
  ],
  status: { type: String, default: 'CREATED' },
  discountCode: { type: String, required: false },
  shippingAddress: { type: String },
  total: { type: Number, default: 0 },
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
