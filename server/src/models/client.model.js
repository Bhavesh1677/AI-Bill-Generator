import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    creditLimit: {
      type: Number,
      default: 5000,
    },
    khataHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["purchase", "payment"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        billId: {
          type: Schema.Types.ObjectId,
          ref: "Bill",
        },
        remarks: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
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

export const Client = mongoose.model("Client", clientSchema);
