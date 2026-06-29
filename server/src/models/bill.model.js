import mongoose, { Schema } from "mongoose";

const billSchema = new Schema(
  {
    billNumber: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "pending", "draft", "overdue"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Store Credit"],
      default: "Cash",
    },
  },
  {
    timestamps: true,
  }
);

export const Bill = mongoose.model("Bill", billSchema);
