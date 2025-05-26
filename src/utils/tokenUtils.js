/**
 * Tiện ích quản lý token JWT
 * Tạo, xác thực và quản lý token an toàn
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// Secret key từ biến môi trường hoặc tạo ngẫu nhiên
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // 1 ngày
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 ngày

/**
 * Tạo token JWT
 * @param {Object} payload - Dữ liệu cần mã hóa trong token
 * @param {string} expiresIn - Thời gian hết hạn (ví dụ: '1h', '1d')
 * @returns {string} - Token JWT
 */
exports.generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (err) {
    logger.error('Lỗi khi tạo token JWT', err);
    throw new Error('Không thể tạo token xác thực.');
  }
};

/**
 * Xác thực và giải mã token JWT
 * @param {string} token - Token JWT cần xác thực
 * @returns {Object} - Dữ liệu đã giải mã
 */
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('Token JWT đã hết hạn');
      throw new Error('Token xác thực đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    if (err.name === 'JsonWebTokenError') {
      logger.warn('Token JWT không hợp lệ', err);
      throw new Error('Token xác thực không hợp lệ.');
    }
    
    logger.error('Lỗi khi xác thực token JWT', err);
    throw new Error('Không thể xác thực token.');
  }
};

/**
 * Tạo refresh token
 * @param {string} userId - ID người dùng
 * @returns {Object} - Refresh token và thời gian hết hạn
 */
exports.generateRefreshToken = (userId) => {
  try {
    // Tạo token ngẫu nhiên
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Tính thời gian hết hạn
    const expiresAt = new Date();
    if (JWT_REFRESH_EXPIRES_IN.endsWith('d')) {
      const days = parseInt(JWT_REFRESH_EXPIRES_IN);
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (JWT_REFRESH_EXPIRES_IN.endsWith('h')) {
      const hours = parseInt(JWT_REFRESH_EXPIRES_IN);
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      // Mặc định 7 ngày
      expiresAt.setDate(expiresAt.getDate() + 7);
    }
    
    return {
      token: refreshToken,
      expiresAt
    };
  } catch (err) {
    logger.error('Lỗi khi tạo refresh token', err);
    throw new Error('Không thể tạo refresh token.');
  }
};

/**
 * Tạo token truy cập và refresh token
 * @param {Object} user - Thông tin người dùng
 * @returns {Object} - Access token và refresh token
 */
exports.generateAuthTokens = async (user) => {
  try {
    // Tạo payload cho JWT
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    // Tạo access token
    const accessToken = exports.generateToken(payload);
    
    // Tạo refresh token
    const refreshTokenData = exports.generateRefreshToken(user.id);
    
    return {
      accessToken,
      refreshToken: refreshTokenData.token,
      refreshTokenExpires: refreshTokenData.expiresAt,
      tokenType: 'Bearer'
    };
  } catch (err) {
    logger.error('Lỗi khi tạo token xác thực', err);
    throw new Error('Không thể tạo token xác thực.');
  }
};

/**
 * Tạo token API
 * @param {string} name - Tên của API key
 * @param {string} userId - ID người dùng tạo API key
 * @returns {string} - API key
 */
exports.generateApiKey = (name, userId) => {
  try {
    const prefix = 'yapee_';
    const randomBytes = crypto.randomBytes(28).toString('hex');
    const apiKey = `${prefix}${randomBytes}`;
    
    return apiKey;
  } catch (err) {
    logger.error('Lỗi khi tạo API key', err);
    throw new Error('Không thể tạo API key.');
  }
};

/**
 * Tạo token CSRF để bảo vệ khỏi tấn công CSRF
 * @returns {string} - Token CSRF
 */
exports.generateCsrfToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Tạo token kích hoạt tài khoản
 * @param {string} userId - ID người dùng
 * @returns {Object} - Token kích hoạt và thời gian hết hạn
 */
exports.generateActivationToken = (userId) => {
  try {
    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString('hex');
    
    // Thời gian hết hạn (24 giờ)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    return {
      token,
      expiresAt
    };
  } catch (err) {
    logger.error('Lỗi khi tạo token kích hoạt', err);
    throw new Error('Không thể tạo token kích hoạt.');
  }
};