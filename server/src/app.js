import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes import
import userRouter from "./routes/user.routes.js";
import clientRouter from "./routes/client.routes.js";
import productRouter from "./routes/product.routes.js";
import billRouter from "./routes/bill.routes.js";
import supplierRouter from "./routes/supplier.routes.js";

const app = express();

app.set("trust proxy", 1);

const cleanOrigin = (url) => (url ? url.trim().replace(/\/$/, "") : "");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = cleanOrigin(origin);

      // Allow any localhost / 127.0.0.1 origin dynamically
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow Vercel production and preview domains
      if (/^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin) || normalizedOrigin === "https://indopos.vercel.app") {
        return callback(null, true);
      }

      // Allow configured origins from CORS_ORIGIN
      const allowedEnv = process.env.CORS_ORIGIN || "http://localhost:5173";
      if (allowedEnv === "*") {
        return callback(null, true);
      }

      const allowedList = allowedEnv.split(",").map(cleanOrigin);
      if (allowedList.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/bills", billRouter);
app.use("/api/v1/suppliers", supplierRouter);

export { app };
