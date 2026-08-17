import { Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../db/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── Create Order ──────────────────────────────────────────
// Called when user clicks "Buy" on paid content

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { contentId } = req.body;
    const userId = req.user!.id;

    if (!contentId) {
      res.status(400).json({ message: "contentId is required" });
      return;
    }

    // 1. Check content exists and is paid
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      res.status(404).json({ message: "Content not found" });
      return;
    }

    if (!content.isPaid || !content.priceInr) {
      res.status(400).json({ message: "This content is free" });
      return;
    }

    // 2. Check already purchased
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_contentId: { userId, contentId },
      },
    });

    if (existing?.status === "COMPLETED") {
      res.status(409).json({ message: "Already purchased" });
      return;
    }

    // 3. Create Razorpay order
    const amountPaise = Math.round(Number(content.priceInr) * 100); // INR to paise

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${contentId}_${userId}`.slice(0, 40),
    });

    // 4. Save pending purchase in DB
    const purchase = await prisma.purchase.upsert({
      where: {
        userId_contentId: { userId, contentId },
      },
      update: {
        razorpayOrderId: razorpayOrder.id,
        status: "PENDING",
      },
      create: {
        userId,
        contentId,
        amountInr: content.priceInr,
        razorpayOrderId: razorpayOrder.id,
        status: "PENDING",
      },
    });

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      purchaseId: purchase.id,
      keyId: process.env.RAZORPAY_KEY_ID, // frontend needs this
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// ─── Verify Payment ────────────────────────────────────────
// Called after Razorpay checkout succeeds on frontend

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user!.id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ message: "Missing payment details" });
      return;
    }

    // 1. Verify signature — this is the security check
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    // 2. Find the pending purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        razorpayOrderId,
        userId,
      },
    });

    if (!purchase) {
      res.status(404).json({ message: "Purchase record not found" });
      return;
    }

    // 3. Mark as completed — access granted
    const updated = await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "COMPLETED",
        razorpayPaymentId,
      },
    });

    res.status(200).json({
      message: "Payment verified, access granted",
      purchase: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ─── Get My Purchases ──────────────────────────────────────

export const myPurchases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const purchases = await prisma.purchase.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            thumbnailUrl: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ purchases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
