export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
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
