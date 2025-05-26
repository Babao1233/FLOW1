/**
 * Middleware bảo mật
 * Bảo vệ ứng dụng khỏi các cuộc tấn công phổ biến
 */

const logger = require('../utils/logger');

/**
 * Middleware thiết lập HTTP Security Headers
 */
exports.securityHeaders = (req, res, next) => {
  // Chống XSS (Cross-Site Scripting)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Chống Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Ngăn chặn trình duyệt đoán MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; " + 
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https://placehold.co; " +
    "connect-src 'self'"
  );
  
  // Chính sách tham chiếu
  res.setHeader('Referrer-Policy', 'same-origin');
  
  next();
};

/**
 * Middleware chống lại tấn công brute force đăng nhập
 * Giới hạn số lần đăng nhập thất bại từ một IP
 */
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 phút

exports.bruteForceProtection = (req, res, next) => {
  // Chỉ áp dụng cho route đăng nhập với phương thức POST
  if (req.path !== '/api/auth/login' || req.method !== 'POST') {
    return next();
  }
  
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Kiểm tra và khởi tạo đối tượng theo dõi IP
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = {
      count: 0,
      lastAttempt: now,
      lockUntil: 0
    };
  }
  
  const attempt = loginAttempts[ip];
  
  // Kiểm tra xem IP có bị khóa không
  if (attempt.lockUntil > now) {
    const remainingTime = Math.ceil((attempt.lockUntil - now) / 1000 / 60);
    logger.warn(`IP ${ip} bị khóa do nhiều lần đăng nhập thất bại. Còn ${remainingTime} phút.`);
    return res.status(429).json({
      success: false,
      message: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${remainingTime} phút.`
    });
  }
  
  // Kiểm tra nếu đã vượt quá số lần thử đăng nhập
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockUntil = now + LOCKOUT_TIME;
    logger.warn(`IP ${ip} bị khóa do nhiều lần đăng nhập thất bại. Thời gian khóa: 15 phút.`);
    const remainingTime = Math.ceil(LOCKOUT_TIME / 1000 / 60);
    return res.status(429).json({
      success: false,
      message: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${remainingTime} phút.`
    });
  }
  
  // Reset số lần thử nếu đã quá thời gian theo dõi (1 giờ)
  if (now - attempt.lastAttempt > 60 * 60 * 1000) {
    attempt.count = 0;
  }
  
  // Cập nhật thời gian thử gần nhất
  attempt.lastAttempt = now;
  
  // Xử lý sau khi đăng nhập hoàn tất (thành công hoặc thất bại)
  const handleLoginResult = (originalSend) => {
    return function(statusCode, body) {
      // Đăng nhập thất bại
      if (statusCode === 401) {
        attempt.count++;
        logger.warn(`Đăng nhập thất bại từ IP ${ip}. Số lần thử: ${attempt.count}/${MAX_ATTEMPTS}`);
        
        // Kiểm tra nếu lần đăng nhập này vượt quá ngưỡng
        if (attempt.count >= MAX_ATTEMPTS) {
          attempt.lockUntil = now + LOCKOUT_TIME;
          logger.warn(`IP ${ip} bị khóa do nhiều lần đăng nhập thất bại. Thời gian khóa: 15 phút.`);
          // Ghi đè phản hồi để đảm bảo trả về 429
          arguments[0] = 429;
          arguments[1] = {
            success: false,
            message: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.`
          };
        }
      } else if (statusCode === 200) {
        // Đăng nhập thành công, reset số lần thử
        attempt.count = 0;
      }
      
      // Gọi hàm send gốc
      originalSend.apply(this, arguments);
    };
  };
  
  // Ghi đè phương thức res.send để theo dõi kết quả đăng nhập
  res.send = handleLoginResult(res.send);
  
  next();
};

/**
 * Middleware chống lại tấn công CSRF (Cross-Site Request Forgery)
 */
exports.csrfProtection = (req, res, next) => {
  // Chỉ áp dụng cho các phương thức thay đổi dữ liệu
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Kiểm tra CSRF token
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    // Kiểm tra referer (trang gửi request)
    const referer = req.headers.referer || '';
    const host = req.headers.host;
    
    // Nếu không có token hoặc referer không thuộc về trang của chúng ta
    if (!csrfToken || (referer && !referer.includes(host))) {
      logger.warn(`Phát hiện yêu cầu đáng ngờ: ${req.method} ${req.path}. Referer: ${referer}`);
      return res.status(403).json({
        success: false,
        message: 'Yêu cầu bị từ chối vì lý do bảo mật.'
      });
    }
    
    // TODO: Xác thực CSRF token khi triển khai đầy đủ
  }
  
  next();
};

/**
 * Middleware giới hạn kích thước yêu cầu
 * Ngăn chặn tấn công DDoS và Flood
 */
exports.requestSizeLimiter = (req, res, next) => {
  // Kiểm tra Content-Length header
  const contentLength = parseInt(req.headers['content-length'], 10) || 0;
  
  // Giới hạn kích thước tối đa là 1MB
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB
  
  if (contentLength > MAX_SIZE) {
    logger.warn(`Yêu cầu quá lớn từ IP ${req.ip}: ${contentLength} bytes`);
    return res.status(413).json({
      success: false,
      message: 'Yêu cầu quá lớn. Giới hạn kích thước là 1MB.'
    });
  }
  
  next();
};

/**
 * Middleware chống SQL Injection
 * Kiểm tra các tham số đầu vào có chứa mã SQL độc hại không
 */
exports.sqlInjectionProtection = (req, res, next) => {
  // Kiểm tra các tham số query
  const query = req.query;
  const body = req.body;
  
  // Danh sách các pattern SQL Injection cơ bản
  const sqlPatterns = [
    /('|%27)(\s|\+)*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)/i,
    /(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)(\s|\+)*FROM/i,
    /UNION(\s|\+)*(SELECT|ALL)/i,
    /--/,
    /;(\s|\+)*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)/i
  ];
  
  // Hàm kiểm tra một giá trị
  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  // Hàm đệ quy kiểm tra tất cả giá trị trong đối tượng
  const checkObject = (obj) => {
    if (!obj) return false;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkValue(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && checkObject(obj[key])) {
        return true;
      }
    }
    
    return false;
  };
  
  // Kiểm tra query parameters và body
  if (checkObject(query) || checkObject(body)) {
    logger.warn(`Phát hiện SQL Injection tiềm ẩn từ IP ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Yêu cầu bị từ chối vì lý do bảo mật.'
    });
  }
  
  next();
};

/**
 * Middleware xử lý CORS (Cross-Origin Resource Sharing)
 */
exports.corsHandler = (req, res, next) => {
  // Cấu hình CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://yapee.vn',
    'https://www.yapee.vn'
  ];
  
  const origin = req.headers.origin;
  
  // Kiểm tra origin có được phép không
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Cho phép các phương thức HTTP
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Cho phép các header
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
  
  // Cho phép sử dụng credentials (cookies, auth headers)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Thời gian cache preflight request
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 giờ
  
  // Xử lý preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};

/**
 * Middleware kiểm tra và lọc các header nhạy cảm
 */
exports.headerSanitizer = (req, res, next) => {
  // Danh sách header nhạy cảm cần kiểm tra
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-forwarded-for',
    'x-real-ip'
  ];
  
  // Ghi log header nhạy cảm (chỉ trong dev mode)
  if (process.env.NODE_ENV !== 'production') {
    sensitiveHeaders.forEach(header => {
      if (req.headers[header]) {
        logger.debug(`Header ${header} được gửi trong yêu cầu đến ${req.path}`);
      }
    });
  }
  
  next();
};

/**
 * Middleware giới hạn tỷ lệ yêu cầu
 * Chống tấn công Flood và DDoS
 */
const requestCounts = {};
const RATE_WINDOW = 60 * 1000; // 1 phút
const RATE_LIMIT = 100; // 100 yêu cầu/phút

exports.rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Khởi tạo đối tượng theo dõi IP
  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 0,
      resetAt: now + RATE_WINDOW
    };
  }
  
  const request = requestCounts[ip];
  
  // Reset counter nếu đã qua cửa sổ thời gian
  if (now > request.resetAt) {
    request.count = 0;
    request.resetAt = now + RATE_WINDOW;
  }
  
  // Tăng số lượng yêu cầu
  request.count++;
  
  // Kiểm tra giới hạn
  if (request.count > RATE_LIMIT) {
    logger.warn(`IP ${ip} vượt quá giới hạn yêu cầu: ${request.count} yêu cầu trong 1 phút.`);
    return res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
    });
  }
  
  next();
};