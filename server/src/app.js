import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes import
import userRouter from "./routes/user.routes.js";
import clientRouter from "./routes/client.routes.js";
import productRouter from "./routes/product.routes.js";
import billRouter from "./routes/bill.routes.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
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