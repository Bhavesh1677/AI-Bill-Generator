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
      min: [0.001, "Quantity must be at least 0.001"],
    },
    billingUnit: {
      type: String,
      enum: ["pieces", "kg", "g", "litre", "ml"],
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: Number,
      required: true,
      default: 1,
    },
    billingQuantity: {
      type: Number,
      min: [0.001, "Billing quantity must be at least 0.001"],
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
