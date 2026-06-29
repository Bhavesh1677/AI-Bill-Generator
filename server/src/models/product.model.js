import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
      min: [0, "Size cannot be negative"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Cost price cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, "Minimum stock level cannot be negative"],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: ["Fruits & Vegetables", "Dairy & Eggs", "Bakery & Bread", "Beverages", "Snacks & Sweets", "Grains & Pulses", "Packaged Food", "Household", "Personal Care", "Other"],
      default: "Other",
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["pieces", "kg", "g", "litre", "ml", "pack"],
      default: "pieces",
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
