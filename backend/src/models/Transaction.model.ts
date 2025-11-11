import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  txId: string;
  from: string;
  to: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  note?: string;
  createdAt: Date;
  confirmedRound?: number;
}

const TransactionSchema: Schema = new Schema(
  {
    txId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
      required: true
    },
    note: {
      type: String,
      default: ""
    },
    confirmedRound: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
