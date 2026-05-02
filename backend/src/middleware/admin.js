/**
 * Admin authorization middleware.
 * Must be used AFTER authMiddleware (req.user must exist).
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = adminMiddleware;
