import { Router } from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this router
router.use(verifyJWT);

router.route("/").post(createClient).get(getClients);
router
  .route("/:clientId")
  .get(getClientById)
  .patch(updateClient)
  .delete(deleteClient);

export default router;
