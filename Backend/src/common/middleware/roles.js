/** Role-based guard. Use after requireAuth: requireRole("admin"), requireRole("shopkeeper","admin") ... */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "Forbidden for this role." });
    }
    return next();
  };
}
