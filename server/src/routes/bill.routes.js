import { Router } from "express";
import {
  createBill,
  getBills,
  getBillById,
  updateBillStatus,
  deleteBill,
} from "../controllers/bill.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this router
router.use(verifyJWT);

router.route("/").post(createBill).get(getBills);
router.route("/:billId").get(getBillById).delete(deleteBill);
router.route("/:billId/status").patch(updateBillStatus);

export default router;
