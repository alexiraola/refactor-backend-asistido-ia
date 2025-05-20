import mongoose from "mongoose";

export class Id {
  private constructor(private readonly value: string) { }

  static create(value?: string) {
    return new Id(value || new mongoose.Types.ObjectId().toString());
  }

  toString() {
    return this.value;
  }
}
