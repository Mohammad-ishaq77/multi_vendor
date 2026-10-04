import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LayoutDashboard, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/common/Toast";
import { APP_CONFIG } from "../../../config/appConfig";
import { ROLES } from "../../../config/roles";

/**
 * Administrator portal sign-in (`/admin`).
 *
 * The admin role is intentionally absent from the public sign-in/sign-up role
 * pickers, so this is the only entry point for administrators. It authenticates
 * against the real API with `role: admin` and only continues when the account
 * actually holds the admin role — the server still enforces `requireRole("admin")`
 * on every admin route, this only avoids showing a dead-end dashboard.
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, role, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // An administrator who already has a session skips this screen.
  useEffect(() => {
    if (!authLoading && role === ROLES.ADMIN) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, role, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your administrator email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await login({ email: email.trim(), password, role: ROLES.ADMIN });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      showToast(result.error, "error");
      return;
    }
    if (result.user?.activeRole !== ROLES.ADMIN) {
      setError("This account does not have administrator access.");
      showToast("This account does not have administrator access.", "error");
      await login({ email, password, role: result.user?.role || "customer" });
      return;
    }
    showToast("Signed in as Administrator");
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--color-surface-tint) px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-(--color-green-soft) blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-(--color-green-light)/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/70 bg-white/85 shadow-[var(--shadow-hover)] backdrop-blur-xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-(--color-primary-dark) via-(--color-primary) to-(--color-green) px-7 py-7 text-white">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            <ShieldCheck className="h-4 w-4" />
            Restricted area
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
            {APP_CONFIG.name} Admin Portal
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Sign in with an administrator account to continue.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Administrator only
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-7 sm:px-8" noValidate>
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nearmart.in"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-11 pr-12"
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
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in..." : "Sign in as Administrator"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-xs text-(--color-text-muted)">
            Not an administrator?{" "}
            <Link to="/login" className="font-semibold text-(--color-primary)">
              Sign in here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;