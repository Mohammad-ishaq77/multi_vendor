import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 px-4 py-8 sm:px-6 relative overflow-hidden">
      {/* Ambient Background Effects */}
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
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-400/[0.04] rounded-full blur-[80px]"
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1040px] overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_32px_100px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] lg:flex lg:min-h-[680px] relative z-10"
      >
        {/* Left Visual Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:flex lg:w-[45%] overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />

          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
            className="absolute bottom-20 -right-20 w-72 h-72 bg-teal-400/15 rounded-full blur-[70px]"
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
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">NearMart</span>
            </motion.div>

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-medium mb-5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-100">Trusted by 50K+ users</span>
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
                Shop Local,
                <br />
                <span className="text-emerald-300">Delivered Fast.</span>
              </h2>
              <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm">
                Connect with shops in your neighborhood and get everything
                delivered to your doorstep in minutes.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: "10K+", label: "Shops" },
                { value: "50K+", label: "Customers" },
                { value: "4.9", label: "Rating" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[0.65rem] text-emerald-200/60 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Panel */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[55%] lg:px-14">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            {/* Mobile Logo */}
            <motion.div variants={itemVariants} className="mb-6 lg:hidden">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-[1.85rem] font-bold text-slate-900 tracking-tight mb-1.5">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500">
                Enter your credentials to access your account
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className={`relative group transition-all duration-300 ${focusedField === "email" ? "scale-[1.01]" : ""}`}>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-[1.1rem] h-[1.1rem] transition-colors duration-300 ${focusedField === "email" ? "text-emerald-600" : "text-slate-400"}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300 hover:bg-white"
                  />
                  {email && email.includes("@") && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className={`relative group transition-all duration-300 ${focusedField === "password" ? "scale-[1.01]" : ""}`}>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-[1.1rem] h-[1.1rem] transition-colors duration-300 ${focusedField === "password" ? "text-emerald-600" : "text-slate-400"}`} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300 hover:bg-white"
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
                          <EyeOff className="w-[1.1rem] h-[1.1rem]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="w-[1.1rem] h-[1.1rem]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                  <div className="relative">
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
                  <span className="group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <motion.a
                  whileHover={{ x: 2 }}
                  href="#"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  Forgot password?
                </motion.a>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.015, boxShadow: "0 24px 48px -12px rgba(5, 150, 105, 0.35)" }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isLoading}
                  className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 py-4 text-[0.9rem] font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:from-emerald-700 hover:via-emerald-700 hover:to-teal-700 disabled:opacity-70 overflow-hidden group"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>Sign In</span>
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

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative flex items-center gap-4 py-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-[0.7rem] font-medium text-slate-400 uppercase tracking-widest">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </motion.div>

            {/* Social Buttons */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.81-.79 1.37.11 2.44.63 3.27 1.5-2.94 1.73-2.46 5.98.22 7.13-.57 1.5-1.31 2.99-2.38 4.39zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 mt-7">
              Don't have an account?{" "}
              <Link to="/register">
                <motion.span
                  whileHover={{ x: 3 }}
                  className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Create Account <ArrowRight className="w-3.5 h-3.5" />
                </motion.span>
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;