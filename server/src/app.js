import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes import
import userRouter from "./routes/user.routes.js";
import clientRouter from "./routes/client.routes.js";
import productRouter from "./routes/product.routes.js";
import billRouter from "./routes/bill.routes.js";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow any localhost origin dynamically (e.g., localhost:5173, localhost:5174, etc.)
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    const allowed = process.env.CORS_ORIGIN || "http://localhost:5173";
    if (allowed === "*" || allowed.split(",").includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/bills", billRouter);

export { app };