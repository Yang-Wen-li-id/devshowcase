const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

/**
 * Middleware to verify JWT token from Authorization header or cookie
 */
const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_devshowcase_production_minimum_32_chars';
    const decoded = jwt.verify(token, secret);

    // Verify user still exists in MariaDB
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'role', 'created_at']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi kedaluwarsa. Pengguna tidak ditemukan.'
      });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kedaluwarsa.',
      error: error.message
    });
  }
};

/**
 * Middleware to restrict route access only to 'admin' role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses terlarang. Anda memerlukan hak akses Administrator.'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
