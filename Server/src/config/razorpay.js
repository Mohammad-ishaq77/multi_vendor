import Razorpay from "razorpay";
import { config } from "./env.js";

export const isRazorpayConfigured = () =>
  Boolean(config.razorpay.keyId && config.razorpay.keySecret);

export const getRazorpayClient = () => {
  if (!isRazorpayConfigured()) return null;
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
};

export const toPaise = (amount) => Math.round(Number(amount) * 100);
