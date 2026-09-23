import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import BrandLogo from "../../../components/common/BrandLogo";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import OtpInputs from "../../../components/auth/OtpInputs";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/common/Toast";
import { APP_CONFIG } from "../../../config/appConfig";
import { ROLES } from "../../../config/roles";

const DUMMY_OTP = "123456";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const roleOptions = [
  {
    id: ROLES.CUSTOMER,
    label: "Customer",
    desc: "Shop nearby stores",
    icon: ShoppingBag,
    next: "Start shopping from local stores right away.",
  },
  {
    id: ROLES.SHOPKEEPER,
    label: "Shopkeeper",
    desc: "Sell from your shop",
    icon: Store,
    next: "Next you'll create your shop and submit documents.",
  },
  {
    id: ROLES.DELIVERY,
    label: "Delivery Agent",
    desc: "Deliver and earn",
    icon: Bike,
    next: "Next you'll complete partner verification.",
  },
  {
    id: ROLES.ADMIN,
    label: "Admin",
    desc: "Manage the platform",
    icon: LayoutDashboard,
    next: "You'll enter the admin dashboard.",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

const getPasswordScore = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 4) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const { showToast } = useToast();

  const requestedRole = searchParams.get("role");
  const initialRole = roleOptions.some((item) => item.id === requestedRole)
    ? requestedRole
    : ROLES.CUSTOMER;

  const [step, setStep] = useState("form");
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(30);

  const activeRole = roleOptions.find((item) => item.id === selectedRole) || roleOptions[0];
  const passwordScore = getPasswordScore(formData.password);
  const phoneRequired = selectedRole === ROLES.SHOPKEEPER || selectedRole === ROLES.DELIVERY;

  useEffect(() => {
    if (requestedRole && roleOptions.some((item) => item.id === requestedRole)) {
      setSelectedRole(requestedRole);
    }
  }, [requestedRole]);

  useEffect(() => {
    if (step !== "otp" || otpSuccess || resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, otpSuccess, resendIn]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      next.name = "Enter your full name";
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (phoneRequired && !PHONE_RE.test(formData.phone.trim())) {
      next.phone = "Enter a valid 10-digit mobile number";
    } else if (formData.phone.trim() && !PHONE_RE.test(formData.phone.trim())) {
      next.phone = "Enter a valid 10-digit mobile number";
    }
    if (!formData.password || formData.password.length < 4) {
      next.password = "Password must be at least 4 characters";
    }
    if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = "Passwords do not match";
    }
    if (!agreedTerms) {
      next.terms = "Please agree to the Terms and Privacy Policy";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setOtpSuccess(false);
      setResendIn(30);
      showToast("Verification code sent to your email");
    }, 700);
  };

  const completeRegistration = () => {
    const result = register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: selectedRole,
    });

    if (!result.ok) {
      setOtpSuccess(false);
      setOtpError(result.error);
      showToast(result.error, "error");
      return;
    }

    showToast(`Welcome to ${APP_CONFIG.name}, ${result.user.name}`);
    navigate(result.redirectTo, { replace: true });
  };

  const handleVerifyOtp = (code = otp.join("")) => {
    if (isVerifying || otpSuccess) return;
    if (code.length !== 6) {
      setOtpError("Enter all 6 digits");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    setTimeout(() => {
      setIsVerifying(false);
      if (code !== DUMMY_OTP) {
        setOtpError("Invalid code. Use 123456 in demo mode.");
        setOtp(["", "", "", "", "", ""]);
        return;
      }
      setOtpSuccess(true);
      setTimeout(completeRegistration, 900);
    }, 800);
  };

  const inputErrorClass = (field) =>
    errors[field] ? "border-rose-300 bg-rose-50/70 focus:border-rose-400" : "";

  const nextLabel = useMemo(() => {
    if (selectedRole === ROLES.SHOPKEEPER) return "Continue to shop setup";
    if (selectedRole === ROLES.DELIVERY) return "Continue to partner setup";
    return "Continue";
  }, [selectedRole]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--color-surface-tint) px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-(--color-green-soft) blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-(--color-green-light)/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-[var(--shadow-hover)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]"
      >
        <AuthCloseButton className="right-4 top-4 lg:right-5 lg:top-5" />

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-(--color-primary-dark) via-(--color-primary) to-(--color-green) p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex flex-col items-start">
            <img
              src={APP_CONFIG.logo}
              alt={`${APP_CONFIG.name} logo`}
              className="h-20 w-20 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
            />
            <span className="mt-4 font-display text-3xl font-bold tracking-tight">{APP_CONFIG.name}</span>
            <span className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Local Marketplace
            </span>
          </Link>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Create account</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight">{activeRole.desc}.</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">{activeRole.next}</p>
            <div className="mt-6 space-y-2.5">
              {["Takes about 2 minutes", "No listing fees to start", "Built for nearby shops & riders"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-5 pb-8 pt-14 sm:px-10 lg:px-12 lg:pt-8">
          <div className="mb-6 lg:hidden">
            <BrandLogo />
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
              >
                <h1 className="font-display text-[1.8rem] font-bold tracking-tight">Create your account</h1>
                <p className="mt-1 text-sm text-(--color-text-muted)">
                  Choose how you want to join {APP_CONFIG.name}.
                </p>

                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4" noValidate>
                  <fieldset>
                    <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-text)">
                      Join as
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {roleOptions.map((item) => {
                        const Icon = item.icon;
                        const active = selectedRole === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedRole(item.id)}
                            aria-pressed={active}
                            className={`flex min-h-[86px] flex-col items-center justify-center gap-1 rounded-[12px] border px-2 py-3 text-center transition-all ${
                              active
                                ? "border-(--color-primary) bg-(--color-green-bg) text-(--color-primary-dark) shadow-[var(--shadow-card)]"
                                : "border-[#dce8e2] bg-white text-(--color-text-muted) hover:border-(--color-green-soft)"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-semibold">{item.label}</span>
                            <span className="hidden text-[10px] leading-tight sm:block">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-(--color-text-muted)">{activeRole.next}</p>
                  </fieldset>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label htmlFor="register-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                        Full name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                        <input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Your name"
                          className={`input-field pl-11 ${inputErrorClass("name")}`}
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="register-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                        <input
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="name@example.com"
                          className={`input-field pl-11 ${inputErrorClass("email")}`}
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-phone" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                      Mobile number {phoneRequired ? "" : <span className="normal-case tracking-normal text-(--color-text-muted)">(optional)</span>}
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                      <input
                        id="register-phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className={`input-field pl-11 ${inputErrorClass("phone")}`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="register-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                        <input
                          id="register-password"
                          type={showPass ? "text" : "password"}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder="Create a password"
                          className={`input-field pl-11 pr-12 ${inputErrorClass("password")}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--color-text-muted) hover:text-(--color-primary)"
                          aria-label={showPass ? "Hide password" : "Show password"}
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <span
                                key={level}
                                className={`h-1.5 flex-1 rounded-full ${
                                  passwordScore >= level ? "bg-(--color-primary)" : "bg-[#e5eee9]"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-[11px] text-(--color-text-muted)">{strengthLabels[passwordScore]}</p>
                        </div>
                      )}
                      {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                    </div>
                    <div>
                      <label htmlFor="register-confirm" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
                        <input
                          id="register-confirm"
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          placeholder="Repeat password"
                          className={`input-field pl-11 pr-12 ${inputErrorClass("confirmPassword")}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-(--color-text-muted) hover:text-(--color-primary)"
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-(--color-text-muted)">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => {
                        setAgreedTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-[#dce8e2] accent-(--color-primary)"
                    />
                    <span>
                      I agree to NearMart's{" "}
                      <span className="font-semibold text-(--color-primary)">Terms</span> and{" "}
                      <span className="font-semibold text-(--color-primary)">Privacy Policy</span>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-rose-600">{errors.terms}</p>}

                  <button type="submit" disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? "Sending code..." : nextLabel}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                    setOtpSuccess(false);
                  }}
                  className="mb-5 inline-flex items-center gap-1.5 text-sm text-(--color-text-muted) hover:text-(--color-primary)"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to details
                </button>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-(--color-green-bg) text-(--color-primary)">
                  {otpSuccess ? <Check className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </div>
                <h1 className="font-display text-[1.8rem] font-bold tracking-tight">
                  {otpSuccess ? "Email verified" : "Verify your email"}
                </h1>
                <p className="mt-1 text-sm text-(--color-text-muted)">
                  {otpSuccess
                    ? activeRole.next
                    : `We sent a 6-digit code to ${formData.email}`}
                </p>

                {otpSuccess ? (
                  <div className="mt-8 flex flex-col items-center gap-3 py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--color-green-soft) border-t-(--color-primary)" />
                    <p className="text-sm text-(--color-text-muted)">Setting up your account...</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <OtpInputs
                      value={otp}
                      onChange={(next) => {
                        setOtp(next);
                        setOtpError("");
                      }}
                      error={otpError}
                      disabled={isVerifying}
                      onComplete={(code) => handleVerifyOtp(code)}
                    />

                    <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs text-amber-800">
                      Demo code: <span className="font-mono font-bold">123456</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isVerifying || otp.join("").length !== 6}
                      className="btn-primary w-full"
                    >
                      {isVerifying ? "Verifying..." : "Verify and create account"}
                      {!isVerifying && <ShieldCheck className="h-4 w-4" />}
                    </button>

                    <p className="text-center text-sm text-(--color-text-muted)">
                      Didn't get the code?{" "}
                      <button
                        type="button"
                        disabled={resendIn > 0}
                        onClick={() => {
                          setOtp(["", "", "", "", "", ""]);
                          setOtpError("");
                          setResendIn(30);
                          showToast("A new code was sent");
                        }}
                        className="font-semibold text-(--color-primary) disabled:text-(--color-text-muted)"
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {step === "form" && (
            <p className="mt-6 text-center text-sm text-(--color-text-muted)">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-(--color-primary)">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
