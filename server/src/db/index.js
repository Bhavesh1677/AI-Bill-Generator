import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const connectionInstance = await mongoose.connect(uri, {
      dbName: DB_NAME,
    });
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("database are not connected", error);
    process.exit(1);
  }
};

export default connectDB;