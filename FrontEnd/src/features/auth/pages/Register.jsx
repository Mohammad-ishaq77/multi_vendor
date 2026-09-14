import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getDashboardPath } from "../../../config/roles";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Store,
  Bike,
  UserCircle,
  Check,
  Shield,
  Zap,
  Gift,
  KeyRound,
  ShieldCheck,
  Building2,
} from "lucide-react";

const DUMMY_OTP = "123456";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState("form");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  const roles = [
    {
      id: "customer",
      label: "Customer",
      desc: "Shop & get delivered",
      icon: UserCircle,
      gradient: "from-emerald-600 to-emerald-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      id: "shopkeeper",
      label: "Shopkeeper",
      desc: "Sell to local customers",
      icon: Store,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      id: "delivery",
      label: "Delivery Agent",
      desc: "Deliver & earn",
      icon: Bike,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      id: "admin",
      label: "Admin",
      desc: "Manage the platform",
      icon: Building2,
      gradient: "from-emerald-800 to-emerald-600",
      shadow: "shadow-emerald-500/20",
    },
  ];

  const benefits = [
    { icon: Shield, text: "Secure payments" },
    { icon: Zap, text: "Lightning fast delivery" },
    { icon: Gift, text: "Exclusive rewards" },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) return;
    if (formData.password !== formData.confirmPassword) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      const lastIndex = Math.min(pasted.length, 5);
      const nextInput = document.getElementById(`otp-${lastIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    setTimeout(() => {
      setIsVerifying(false);
      if (otpValue === DUMMY_OTP) {
        setOtpSuccess(true);
        const result = register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        });
        setTimeout(() => {
          const fallback =
            selectedRole === "shopkeeper"
              ? "/shopkeeper/onboarding"
              : selectedRole === "delivery"
                ? "/delivery/onboarding/guidelines"
                : getDashboardPath(selectedRole);
          navigate(result.redirectTo || fallback, { replace: true });
        }, 1200);
      } else {
        setOtpError("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();
      }
    }, 1500);
  };

  const inputClass = (field) =>
    `w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-[0.8rem] text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300 hover:bg-white ${
      focusedField === field ? "scale-[1.01] border-emerald-500 bg-white" : ""
    }`;

  const iconClass = (field) =>
    `absolute left-4 top-1/2 -translate-y-1/2 w-[1.1rem] h-[1.1rem] transition-colors duration-300 ${
      focusedField === field ? "text-emerald-600" : "text-slate-400"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 px-4 py-8 sm:px-6 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -25, 35, 0],
            y: [0, 30, -25, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-40 -right-32 w-[600px] h-[600px] bg-teal-500/[0.06] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, -15, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-400/[0.04] rounded-full blur-[80px]"
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1100px] overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_32px_100px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] lg:flex lg:min-h-[740px] relative z-10"
      >
        <AuthCloseButton className="right-4 top-4 lg:right-5 lg:top-5" />
        {/* Left Visual Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:flex lg:w-[42%] overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative Blobs */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-[60px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-32 -right-20 w-72 h-72 bg-teal-400/15 rounded-full blur-[70px]"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">NearMart</span>
            </motion.div>

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
                Start Your
                <br />
                <span className="text-emerald-300">Journey Today.</span>
              </h2>
              <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm mb-8">
                Join thousands of shopkeepers, delivery agents, and customers
                building the future of local commerce.
              </p>

              {/* Benefits */}
              <div className="space-y-3.5">
                {benefits.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.15 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-300" />
                      </div>
                      <span className="text-sm text-emerald-100/80">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center gap-6 pt-6 border-t border-white/10"
            >
              <div>
                <div className="text-2xl font-bold">2 min</div>
                <div className="text-[0.65rem] text-emerald-200/60 uppercase tracking-wider">To Sign Up</div>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <div className="text-2xl font-bold">Free</div>
                <div className="text-[0.65rem] text-emerald-200/60 uppercase tracking-wider">Forever</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Panel */}
        <div className="flex w-full flex-col justify-center px-6 pb-8 pt-14 sm:px-10 lg:w-[58%] lg:px-12 lg:pt-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-lg mx-auto"
          >
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mobile Logo */}
                  <motion.div variants={itemVariants} className="mb-4 lg:hidden">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
                      <User className="w-5 h-5" />
                    </div>
                  </motion.div>

                  {/* Header */}
                  <motion.div variants={itemVariants} className="mb-5">
                    <h1 className="text-[1.65rem] font-bold text-slate-900 tracking-tight mb-1">
                      Create your account
                    </h1>
                    <p className="text-sm text-slate-500">
                      Fill in the details below to get started
                    </p>
                  </motion.div>

                  <form onSubmit={handleFormSubmit} className="space-y-3.5">
                    {/* Row: Name + Email */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[0.65rem] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Full Name
                        </label>
                        <div className="relative group">
                          <User className={iconClass("name")} />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            className={inputClass("name")}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Email
                        </label>
                        <div className="relative group">
                          <Mail className={iconClass("email")} />
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            className={inputClass("email")}
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Row: Password + Confirm */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[0.65rem] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Password
                        </label>
                        <div className="relative group">
                          <Lock className={iconClass("password")} />
                          <input
                            type={showPass ? "text" : "password"}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField(null)}
                            className={inputClass("password") + " !pr-11"}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              {showPass ? (
                                <motion.div
                                  key="eyeoff"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <EyeOff className="w-[1.05rem] h-[1.05rem]" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="eye"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Eye className="w-[1.05rem] h-[1.05rem]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Confirm Password
                        </label>
                        <div className="relative group">
                          <Lock className={iconClass("confirm")} />
                          <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            onFocus={() => setFocusedField("confirm")}
                            onBlur={() => setFocusedField(null)}
                            className={inputClass("confirm") + " !pr-11"}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              {showConfirm ? (
                                <motion.div
                                  key="eyeoff2"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <EyeOff className="w-[1.05rem] h-[1.05rem]" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="eye2"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Eye className="w-[1.05rem] h-[1.05rem]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Role Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-[0.65rem] font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Choose Your Role
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {roles.map((role) => {
                          const Icon = role.icon;
                          const isActive = selectedRole === role.id;
                          return (
                            <motion.button
                              key={role.id}
                              type="button"
                              onClick={() => setSelectedRole(role.id)}
                              whileHover={{ y: -3, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              className={`relative flex flex-col items-center text-center rounded-2xl border p-3 transition-all duration-300 ${
                                isActive
                                  ? `border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg ${role.shadow}`
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                              }`}
                            >
                              {/* Check Badge */}
                              <AnimatePresence>
                                {isActive && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shadow-sm"
                                  >
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                                  isActive
                                    ? `bg-gradient-to-br ${role.gradient} text-white shadow-lg ${role.shadow}`
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <span
                                className={`text-[0.72rem] font-semibold leading-tight ${
                                  isActive ? "text-emerald-700" : "text-slate-700"
                                }`}
                              >
                                {role.label}
                              </span>
                              <span className="text-[0.58rem] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                                {role.desc}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Terms */}
                    <motion.div variants={itemVariants} className="flex items-start gap-2.5">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:bg-emerald-600 checked:border-emerald-600 transition-all duration-200"
                        />
                        <svg
                          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[0.75rem] text-slate-500 leading-relaxed">
                        I agree to NearMart's{" "}
                        <a href="#" className="text-emerald-600 font-semibold hover:underline">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-emerald-600 font-semibold hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileHover={{ scale: 1.015, boxShadow: "0 24px 48px -12px rgba(5, 150, 105, 0.35)" }}
                        whileTap={{ scale: 0.985 }}
                        type="submit"
                        disabled={isLoading}
                        className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 py-4 text-[0.9rem] font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:from-emerald-700 hover:via-emerald-700 hover:to-teal-700 disabled:opacity-70 overflow-hidden"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <>
                            <span>Continue</span>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </>
                        )}
                        <motion.div
                          initial={{ x: "-100%", opacity: 0 }}
                          animate={{ x: "200%", opacity: 0 }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                /* OTP Verification Step */
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Back Button */}
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      setStep("form");
                      setOtp(["", "", "", "", "", ""]);
                      setOtpError("");
                      setOtpSuccess(false);
                    }}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to form</span>
                  </motion.button>

                  {/* OTP Icon */}
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-center mb-5"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      {otpSuccess ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <ShieldCheck className="w-8 h-8 text-white" />
                        </motion.div>
                      ) : (
                        <KeyRound className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </motion.div>

                  {/* Header */}
                  <motion.div variants={itemVariants} className="text-center mb-6">
                    <h1 className="text-[1.65rem] font-bold text-slate-900 tracking-tight mb-1">
                      {otpSuccess ? "Email Verified!" : "Verify your email"}
                    </h1>
                    <p className="text-sm text-slate-500">
                      {otpSuccess
                        ? "Redirecting you to your dashboard..."
                        : (
                          <>
                            We sent a 6-digit code to{" "}
                            <span className="font-semibold text-slate-700">{formData.email}</span>
                          </>
                        )
                      }
                    </p>
                  </motion.div>

                  {otpSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                      >
                        <Check className="w-10 h-10 text-emerald-600" />
                      </motion.div>
                      <p className="text-sm text-slate-500">Taking you to your dashboard...</p>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full"
                      />
                    </motion.div>
                  ) : (
                    <>
                      {/* OTP Input */}
                      <motion.div variants={itemVariants} className="mb-4">
                        <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onFocus={() => setFocusedField(`otp-${index}`)}
                              onBlur={() => setFocusedField(null)}
                              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-300 ${
                                focusedField === `otp-${index}`
                                  ? "border-emerald-500 bg-white ring-4 ring-emerald-500/10 scale-105"
                                  : digit
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        {otpError && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-sm text-red-500 mt-3"
                          >
                            {otpError}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Dummy OTP hint */}
                      <motion.div variants={itemVariants} className="mb-4">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                          <p className="text-[0.75rem] text-amber-700">
                            <span className="font-semibold">Demo Mode:</span> Use OTP{" "}
                            <span className="font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">123456</span>{" "}
                            to verify
                          </p>
                        </div>
                      </motion.div>

                      {/* Verify Button */}
                      <motion.div variants={itemVariants}>
                        <motion.button
                          whileHover={{ scale: 1.015, boxShadow: "0 24px 48px -12px rgba(5, 150, 105, 0.35)" }}
                          whileTap={{ scale: 0.985 }}
                          onClick={handleVerifyOtp}
                          disabled={isVerifying || otp.join("").length !== 6}
                          className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 py-4 text-[0.9rem] font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:from-emerald-700 hover:via-emerald-700 hover:to-teal-700 disabled:opacity-70 overflow-hidden"
                        >
                          {isVerifying ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              <span>Verify & Create Account</span>
                              <ShieldCheck className="w-4 h-4" />
                            </>
                          )}
                          <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: "200%", opacity: 0 }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          />
                        </motion.button>
                      </motion.div>

                      {/* Resend OTP */}
                      <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 mt-5">
                        Didn't receive the code?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setOtp(["", "", "", "", "", ""]);
                            setOtpError("");
                            const firstInput = document.getElementById("otp-0");
                            if (firstInput) firstInput.focus();
                          }}
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          Resend
                        </button>
                      </motion.p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer - only show on form step */}
            {step === "form" && (
              <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 mt-5">
                Already have an account?{" "}
                <Link to="/login">
                  <motion.span
                    whileHover={{ x: 3 }}
                    className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Sign In <ArrowRight className="w-3.5 h-3.5" />
                  </motion.span>
                </Link>
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
