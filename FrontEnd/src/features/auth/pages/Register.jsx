import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import BrandLogo from "../../../components/common/BrandLogo";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/common/Toast";
import { APP_CONFIG } from "../../../config/appConfig";
import { PUBLIC_ROLE_META, ROLES } from "../../../config/roles";
import RoleSelector from "../components/RoleSelector";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const roleDetails = {
  [ROLES.CUSTOMER]: {
    desc: "Shop nearby stores",
  },
  [ROLES.SHOPKEEPER]: {
    desc: "Sell from your shop",
    next: "Next you'll create your shop and submit documents.",
  },
  [ROLES.DELIVERY]: {
    desc: "Deliver and earn",
    next: "Next you'll complete partner verification.",
  },
};

const roleOptions = PUBLIC_ROLE_META.map((item) => ({
  ...item,
  ...roleDetails[item.id],
}));

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

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activeRole = roleOptions.find((item) => item.id === selectedRole) || roleOptions[0];
  const passwordScore = getPasswordScore(formData.password);

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
    if (!PHONE_RE.test(formData.phone.trim())) {
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: selectedRole,
    });
    setIsLoading(false);

    if (!result.ok) {
      setSubmitError(result.error);
      showToast(result.error, "error");
      return;
    }

    showToast(`Welcome to ${APP_CONFIG.name}, ${result.user.name}`);
    navigate(result.redirectTo, { replace: true });
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
            {activeRole.next && (
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">{activeRole.next}</p>
            )}
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

          <motion.div
            key="form"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
          >
                <h1 className="font-display text-[1.8rem] font-bold tracking-tight">Create your account</h1>
                <p className="mt-1 text-sm text-(--color-text-muted)">
                  Choose how you want to join {APP_CONFIG.name}.
                </p>

                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <RoleSelector legend="Join as" selectedRole={selectedRole} onSelect={setSelectedRole} />
                    {activeRole.next && (
                      <p className="mt-2 text-xs text-(--color-text-muted)">{activeRole.next}</p>
                    )}
                  </div>

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
                      Mobile number
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

{submitError && (
                    <p
                      className="rounded-[12px] border border-(--color-green-soft) bg-(--color-green-bg) px-3 py-2 text-sm text-(--color-primary-dark)"
                      role="alert"
                    >
                      {submitError}
                    </p>
                  )}

                  <button type="submit" disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? "Creating account..." : nextLabel}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              </motion.div>

<p className="mt-6 text-center text-sm text-(--color-text-muted)">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-(--color-primary)">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
