import crypto from "crypto";
import { razorpayInstance } from "../../../config/razorpay";
import { IRazorpayService } from '../interfaces/finance.interface';

export class RazorpayService implements IRazorpayService {

  async createOrder(amount: number, receiptId: string): Promise<any> {
    if (!razorpayInstance) {
      console.error("Razorpay Error: key_id is missing in environment variables");
      throw new Error("Payment service is currently unavailable");
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: receiptId,
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Error:", error);
      throw new Error("Failed to create Razorpay order");
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    const text = orderId + "|" + paymentId;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  }
}
