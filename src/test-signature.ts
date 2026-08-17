import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const razorpayOrderId = "order_TBibAZ9zdL9cjQ";
const razorpayPaymentId = "pay_test_dummy123";
const secret = process.env.RAZORPAY_KEY_SECRET!;

console.log("Using secret:", secret); // verify kar lo

const body = razorpayOrderId + "|" + razorpayPaymentId;
const signature = crypto
  .createHmac("sha256", secret)
  .update(body)
  .digest("hex");

console.log("Signature:", signature);
