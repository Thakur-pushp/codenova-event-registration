export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_KEY;
  const provided = req.get("x-admin-key");

  if (!expected || !provided || provided !== expected) {
    return res.status(401).json({ message: "Admin access denied. Check your admin key." });
  }
  next();
}
