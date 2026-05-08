import Razorpay from "razorpay";
import { config } from "./index";

export const razorpayInstance = config.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    })
  : null;