import { Router } from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  restockProduct,
} from "../controllers/supplier.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this router
router.use(verifyJWT);

router.route("/").post(createSupplier).get(getSuppliers);
router
  .route("/:supplierId")
  .patch(updateSupplier)
  .delete(deleteSupplier);

router.route("/restock/:productId").post(restockProduct);

export default router;
