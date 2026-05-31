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
    unit: {
      type: String,
      required: true,
      enum: ["pieces", "kg", "g", "litre", "ml"],
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
