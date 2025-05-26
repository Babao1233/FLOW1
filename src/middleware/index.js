/**
 * File xuất tất cả middleware ra ngoài
 * Tạo một điểm nhập nhất quản lý tất cả middleware của ứng dụng
 */

// Import các middleware
const contentSecurityPolicy = require('./content-security');
const { loginRateLimit, registerRateLimit, passwordResetRateLimit, apiRateLimit } = require('./rate-limiter');
const { notFoundHandler, authenticationErrorHandler, authorizationErrorHandler, validationErrorHandler, databaseErrorHandler, globalErrorHandler } = require('./errorHandler');
const { isAuthenticated, hasRole } = require('./auth');

// Xuất ra ngoài
module.exports = {
  // Middleware bảo mật
  contentSecurityPolicy,
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  apiRateLimit,
  
  // Middleware xác thực và phân quyền
  isAuthenticated,
  hasRole,
  
  // Middleware xử lý lỗi
  notFoundHandler,
  authenticationErrorHandler,
  authorizationErrorHandler,
  validationErrorHandler,
  databaseErrorHandler,
  globalErrorHandler,
};
