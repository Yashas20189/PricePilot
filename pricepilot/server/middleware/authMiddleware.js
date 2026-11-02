const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.user?.userId) throw new Error("Invalid token payload");
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
module.exports = authMiddleware;
