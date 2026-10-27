const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_devshowcase_production_minimum_32_chars';
const TOKEN_EXPIRY = '7d';

/**
 * Admin / User Login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    // Search by username or email
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid. Silakan periksa kembali username dan password Anda.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kredensial tidak valid. Silakan periksa kembali username dan password Anda.'
      });
    }

    // Create JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Store in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses login.',
      error: error.message
    });
  }
};

/**
 * Get current authenticated user profile
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.',
      error: error.message
    });
  }
};

/**
 * Logout and clear session cookie
 */
const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logout berhasil. Sesi telah diakhiri.'
  });
};

module.exports = {
  login,
  getProfile,
  logout
};
