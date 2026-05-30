import mongoose, { Schema } from "mongoose";

const billItemSchema = new Schema(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "UnitPrice cannot be negative"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

export const BillItem = mongoose.model("BillItem", billItemSchema);
