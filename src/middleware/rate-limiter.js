/**
 * Middleware giới hạn tốc độ truy cập API
 * Bảo vệ khỏi tấn công brute-force vào API đăng nhập và các endpoint nhạy cảm
 */

// Sử dụng thuật toán cửa sổ trượt để giới hạn tốc độ
class SlidingWindowRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
    
    // Tự động dọn dẹp store để tránh rò rỉ bộ nhớ
    // Chỉ chạy trong môi trường sản xuất để tránh open handles trong tests
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), windowMs);
    }
  }
  
  // Dọn dẹp các IP đã hết thời gian theo dõi
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.store.entries()) {
      if (now - data.windowStart > this.windowMs) {
        this.store.delete(ip);
      }
    }
  }
  
  // Kiểm tra và cập nhật giới hạn cho một IP
  hit(ip) {
    const now = Date.now();
    
    if (!this.store.has(ip)) {
      this.store.set(ip, {
        windowStart: now,
        count: 1
      });
      return { limited: false, remaining: this.maxRequests - 1 };
    }
    
    const data = this.store.get(ip);
    
    // Nếu đã quá thời gian cửa sổ, reset lại
    if (now - data.windowStart > this.windowMs) {
      this.store.set(ip, {
        windowStart: now,
        count: 1
      });
      return { limited: false, remaining: this.maxRequests - 1 };
    }
    
    // Tăng số lần truy cập và kiểm tra giới hạn
    data.count += 1;
    const remaining = this.maxRequests - data.count;
    const limited = data.count > this.maxRequests;
    
    return { limited, remaining: Math.max(0, remaining) };
  }
}

// Tạo các giới hạn cho các loại endpoint khác nhau
const loginLimiter = new SlidingWindowRateLimiter(15 * 60 * 1000, 5); // 5 lần trong 15 phút
const registerLimiter = new SlidingWindowRateLimiter(60 * 60 * 1000, 3); // 3 lần trong 1 giờ
const passwordResetLimiter = new SlidingWindowRateLimiter(60 * 60 * 1000, 3); // 3 lần trong 1 giờ
const apiLimiter = new SlidingWindowRateLimiter(60 * 1000, 100); // 100 lần trong 1 phút

// Middleware chính xuất ra ngoài
module.exports = {
  // Giới hạn cho API đăng nhập
  loginRateLimit: (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const result = loginLimiter.hit(ip);
    
    // Thêm header thông báo giới hạn còn lại
    res.setHeader('X-RateLimit-Limit', loginLimiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    
    if (result.limited) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.',
        retryAfter: Math.ceil(loginLimiter.windowMs / 1000 / 60) // Phút
      });
    }
    
    next();
  },
  
  // Giới hạn cho API đăng ký
  registerRateLimit: (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const result = registerLimiter.hit(ip);
    
    res.setHeader('X-RateLimit-Limit', registerLimiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    
    if (result.limited) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ.',
        retryAfter: Math.ceil(registerLimiter.windowMs / 1000 / 60) // Phút
      });
    }
    
    next();
  },
  
  // Giới hạn cho API khôi phục mật khẩu
  passwordResetRateLimit: (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const result = passwordResetLimiter.hit(ip);
    
    res.setHeader('X-RateLimit-Limit', passwordResetLimiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    
    if (result.limited) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu khôi phục mật khẩu. Vui lòng thử lại sau 1 giờ.',
        retryAfter: Math.ceil(passwordResetLimiter.windowMs / 1000 / 60) // Phút
      });
    }
    
    next();
  },
  
  // Giới hạn chung cho mọi API
  apiRateLimit: (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const result = apiLimiter.hit(ip);
    
    res.setHeader('X-RateLimit-Limit', apiLimiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    
    if (result.limited) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu API. Vui lòng thử lại sau 1 phút.',
        retryAfter: Math.ceil(apiLimiter.windowMs / 1000) // Giây
      });
    }
    
    next();
  }
};
