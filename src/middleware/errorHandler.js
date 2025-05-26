/**
 * Middleware xử lý lỗi toàn cục
 * Xử lý tất cả các lỗi có thể xảy ra trong quá trình xử lý yêu cầu
 * và trả về phản hồi lỗi theo định dạng chuẩn
 */

// Định dạng phản hồi lỗi
const formatError = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return {
    statusCode,
    body: response
  };
};

// Middleware xử lý lỗi không tìm thấy đường dẫn (404)
exports.notFoundHandler = (req, res, next) => {
  const { statusCode, body } = formatError(
    `Không tìm thấy đường dẫn: ${req.originalUrl}`,
    404
  );
  res.status(statusCode).json(body);
};

// Middleware xử lý lỗi xác thực (401)
exports.authenticationErrorHandler = (err, req, res, next) => {
  if (err.name === 'AuthenticationError') {
    const { statusCode, body } = formatError(
      err.message || 'Lỗi xác thực. Vui lòng đăng nhập.',
      401
    );
    return res.status(statusCode).json(body);
  }
  next(err);
};

// Middleware xử lý lỗi phân quyền (403)
exports.authorizationErrorHandler = (err, req, res, next) => {
  if (err.name === 'AuthorizationError') {
    const { statusCode, body } = formatError(
      err.message || 'Bạn không có quyền thực hiện hành động này.',
      403
    );
    return res.status(statusCode).json(body);
  }
  next(err);
};

// Middleware xử lý lỗi dữ liệu (400)
exports.validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const { statusCode, body } = formatError(
      err.message || 'Dữ liệu không hợp lệ.',
      400,
      err.errors
    );
    return res.status(statusCode).json(body);
  }
  next(err);
};

// Middleware xử lý lỗi cơ sở dữ liệu
exports.databaseErrorHandler = (err, req, res, next) => {
  if (err.name === 'DatabaseError' || err.code) {
    // Log chi tiết lỗi database để debug nhưng không gửi cho client
    console.error('Lỗi cơ sở dữ liệu:', err);
    
    // Xử lý một số mã lỗi PostgreSQL phổ biến
    let message = 'Lỗi cơ sở dữ liệu.';
    let statusCode = 500;
    
    if (err.code === '23505') { // Unique violation
      message = 'Dữ liệu đã tồn tại.';
      statusCode = 409; // Conflict
    } else if (err.code === '23503') { // Foreign key violation
      message = 'Dữ liệu liên quan không tồn tại.';
      statusCode = 400; // Bad Request
    } else if (err.code === '23502') { // Not null violation
      message = 'Thiếu thông tin bắt buộc.';
      statusCode = 400; // Bad Request
    }
    
    const { statusCode: errStatusCode, body } = formatError(message, statusCode);
    return res.status(errStatusCode).json(body);
  }
  next(err);
};

// Middleware xử lý lỗi cuối cùng (500 - nếu không có middleware nào xử lý)
exports.globalErrorHandler = (err, req, res, next) => {
  console.error('Lỗi không xác định:', err);
  
  // Trong môi trường production, không nên gửi stack trace về client
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const { statusCode, body } = formatError(
    'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
    500
  );
  
  // Thêm thông tin stack trace trong môi trường development
  if (isDevelopment) {
    body.stack = err.stack;
  }
  
  res.status(statusCode).json(body);
};

// Lớp lỗi tùy chỉnh
exports.AppError = class AppError extends Error {
  constructor(message, name = 'AppError', statusCode = 500, errors = null) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.errors = errors;
  }
  
  static badRequest(message, errors) {
    return new AppError(message, 'ValidationError', 400, errors);
  }
  
  static unauthorized(message) {
    return new AppError(message, 'AuthenticationError', 401);
  }
  
  static forbidden(message) {
    return new AppError(message, 'AuthorizationError', 403);
  }
  
  static notFound(message) {
    return new AppError(message, 'NotFoundError', 404);
  }
  
  static database(message, code) {
    const error = new AppError(message, 'DatabaseError', 500);
    error.code = code;
    return error;
  }
};