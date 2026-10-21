import { API_BASE_URL, RAZORPAY_PUBLIC_KEY } from "./env";

export const RAZORPAY_CONFIG = {
  keyId: RAZORPAY_PUBLIC_KEY,
  apiBaseUrl: API_BASE_URL,
  currency: "INR",
  companyName: "NearMart",
  themeColor: "#047857",
  methods: [
    { id: "upi", label: "UPI", detail: "Google Pay, PhonePe, BharatPe & other UPI apps" },
    { id: "card", label: "Cards", detail: "Credit and debit cards" },
    { id: "netbanking", label: "Net Banking", detail: "All major Indian banks" },
    { id: "wallet", label: "Wallets", detail: "Paytm, Amazon Pay and other wallets" },
  ],
};

export const isRazorpayConfigured = () => Boolean(RAZORPAY_CONFIG.keyId);

export const hasPaymentBackend = () => Boolean(RAZORPAY_CONFIG.apiBaseUrl);

export default RAZORPAY_CONFIG;
