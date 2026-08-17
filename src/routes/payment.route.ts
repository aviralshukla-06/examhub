import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createOrder,
  verifyPayment,
  myPurchases,
} from "../controllers/payment.controller";

const router = express.Router();

router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.get("/my-purchases", authenticate, myPurchases);

export default router;
