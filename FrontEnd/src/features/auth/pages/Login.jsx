import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Mail,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import BrandLogo from "../../../components/common/BrandLogo";
import AuthCloseButton from "../../../components/common/AuthCloseButton";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/common/Toast";
import { APP_CONFIG, TEST_CREDENTIALS } from "../../../config/appConfig";
import { ROLE_META } from "../../../config/roles";

const roleIcons = {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Truck,
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState(TEST_CREDENTIALS.email);
  const [password, setPassword] = useState(TEST_CREDENTIALS.password);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = login({ email, password, role });
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      showToast(result.error, "error");
      return;
    }

    showToast(`Signed in as ${result.user.roleLabel}`);
    navigate(result.redirectTo, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-surface-tint)] px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[var(--color-green-soft)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--color-green-light)]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-[var(--shadow-hover)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]"
      >
        <AuthCloseButton className="right-4 top-4 lg:right-5 lg:top-5" />
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-green)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <BrandLogo inverted to="/" subtitle="Local Marketplace" />
          <div>
            <p className="badge-soft !bg-white/10 !text-white">Frontend test login</p>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight">
              Shop local.
              <br />
              Delivered fast.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Use the shared test account and switch roles to preview every NearMart dashboard.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
            <p className="font-semibold">Test credentials</p>
            <p className="mt-2 text-white/80">Email: {TEST_CREDENTIALS.email}</p>
            <p className="text-white/80">Password: {TEST_CREDENTIALS.password}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-5 pb-8 pt-14 sm:px-10 lg:px-12 lg:pt-8">
          <div className="mb-6 lg:hidden">
            <BrandLogo />
          </div>
          <h1 className="font-display text-[1.8rem] font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Sign in with the test account and choose a role to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text)]">
                Login as
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROLE_META.map((item) => {
                  const Icon = roleIcons[item.icon] || ShoppingBag;
                  const active = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-[12px] border px-2 py-3 text-center text-xs font-semibold transition-all ${
                        active
                          ? "border-[var(--color-primary)] bg-[var(--color-green-bg)] text-[var(--color-primary-dark)] shadow-[var(--shadow-card)]"
                          : "border-[#dce8e2] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-green-soft)]"
                      }`}
                      aria-pressed={active}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                Email / ID
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="login-email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={TEST_CREDENTIALS.email}
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#dce8e2] accent-[var(--color-primary)]"
                />
                Keep me signed in
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[12px] border border-[var(--color-green-soft)] bg-[var(--color-green-bg)] px-3 py-2 text-sm text-[var(--color-primary-dark)]"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            New to {APP_CONFIG.name}?{" "}
            <Link to="/register" className="font-semibold text-[var(--color-primary)]">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
