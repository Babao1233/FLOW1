/**
 * Middleware xác thực và phân quyền
 * Bảo vệ các API yêu cầu đăng nhập và kiểm tra quyền truy cập
 */

const pool = require('../../database');
const logger = require('../utils/logger');
const { AppError } = require('./errorHandler');

/**
 * Middleware kiểm tra người dùng đã đăng nhập chưa
 */
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Kiểm tra phiên đăng nhập
    if (!req.session || !req.session.userId) {
      throw new AppError('Bạn cần đăng nhập để thực hiện thao tác này.', 'AuthenticationError', 401);
    }
    
    // Kiểm tra người dùng có tồn tại trong database không
    const result = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      // Hủy phiên nếu không tìm thấy người dùng
      req.session.destroy();
      throw new AppError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.', 'AuthenticationError', 401);
    }
    
    const user = result.rows[0];
    
    // Kiểm tra người dùng có bị vô hiệu hóa không
    if (user.is_active === false) {
      req.session.destroy();
      throw new AppError('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.', 'AuthorizationError', 403);
    }
    
    // Lưu thông tin người dùng vào request để sử dụng trong các middleware và route tiếp theo
    req.user = user;
    
    // Cập nhật thời gian hoạt động cuối cùng
    req.session.lastActive = Date.now();
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware kiểm tra quyền người dùng
 * @param {string|Array} roles - Role hoặc mảng các role được phép truy cập
 */
exports.hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra middleware isAuthenticated đã được chạy chưa
      if (!req.user) {
        throw new AppError('Bạn cần đăng nhập để thực hiện hành động này.', 'AuthenticationError', 401);
      }
      
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Kiểm tra quyền
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Người dùng ${req.user.id} với vai trò ${req.user.role} cố gắng truy cập tài nguyên yêu cầu quyền ${allowedRoles.join(', ')}`);
        throw new AppError('Bạn không có quyền thực hiện hành động này.', 'AuthorizationError', 403);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware kiểm tra quyền sở hữu tài nguyên
 * @param {string} resourceType - Loại tài nguyên (address, order, etc.)
 * @param {string} paramName - Tên tham số chứa ID tài nguyên
 * @param {Function} getResourceOwner - Hàm lấy ID chủ sở hữu của tài nguyên (optional)
 */
exports.isResourceOwner = (resourceType, paramName, getResourceOwner) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra middleware isAuthenticated đã được chạy chưa
      if (!req.user) {
        throw new AppError('Bạn cần đăng nhập để thực hiện hành động này.', 'AuthenticationError', 401);
      }
      
      const resourceId = req.params[paramName] || req.body[paramName];
      
      if (!resourceId) {
        throw new AppError(`ID ${resourceType} không được cung cấp.`, 'ValidationError', 400);
      }
      
      let ownerId;
      
      if (typeof getResourceOwner === 'function') {
        // Sử dụng hàm tùy chỉnh để lấy ID chủ sở hữu
        ownerId = await getResourceOwner(resourceId, req);
      } else {
        // Mặc định: truy vấn database dựa trên loại tài nguyên
        let query;
        
        switch(resourceType) {
          case 'address':
            query = 'SELECT user_id FROM user_addresses WHERE id = $1';
            break;
          case 'order':
            query = 'SELECT user_id FROM orders WHERE id = $1';
            break;
          case 'review':
            query = 'SELECT user_id FROM product_reviews WHERE id = $1';
            break;
          default:
            query = `SELECT user_id FROM ${resourceType}s WHERE id = $1`;
        }
        
        const result = await pool.query(query, [resourceId]);
        
        if (result.rows.length === 0) {
          throw new AppError(`Không tìm thấy ${resourceType} với ID: ${resourceId}`, 'NotFoundError', 404);
        }
        
        ownerId = result.rows[0].user_id;
      }
      
      // Kiểm tra người dùng có phải là chủ sở hữu không
      if (ownerId !== req.user.id && req.user.role !== 'admin') {
        logger.warn(`Người dùng ${req.user.id} ${req.user.username} cố gắng truy cập ${resourceType} ${resourceId} không thuộc quyền sở hữu`);
        throw new AppError('Bạn không có quyền truy cập tài nguyên này.', 'AuthorizationError', 403);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware xác thực API key cho các request từ dịch vụ bên ngoài
 */
exports.apiKeyAuth = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    // Kiểm tra API key có tồn tại không
    if (!apiKey) {
      throw new AppError('API key là bắt buộc.', 'AuthenticationError', 401);
    }
    
    // Kiểm tra API key có hợp lệ không
    // TODO: Lưu API key trong database hoặc biến môi trường
    const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
    
    if (!validApiKeys.includes(apiKey)) {
      logger.warn(`Yêu cầu API với key không hợp lệ: ${apiKey}`);
      throw new AppError('API key không hợp lệ.', 'AuthenticationError', 401);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware kiểm tra phiên làm việc hết hạn
 * Đảm bảo người dùng phải đăng nhập lại nếu không hoạt động trong thời gian dài
 */
exports.sessionTimeout = (req, res, next) => {
  try {
    // Chỉ kiểm tra với các phiên đã đăng nhập
    if (req.session && req.session.userId && req.session.lastActive) {
      const now = Date.now();
      const lastActive = req.session.lastActive;
      
      // Thời gian không hoạt động tối đa (30 phút)
      const MAX_INACTIVITY = 30 * 60 * 1000;
      
      if (now - lastActive > MAX_INACTIVITY) {
        // Hủy phiên và yêu cầu đăng nhập lại
        req.session.destroy();
        throw new AppError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'AuthenticationError', 401);
      }
      
      // Cập nhật thời gian hoạt động cuối cùng
      req.session.lastActive = now;
    }
    
    next();
  } catch (err) {
    next(err);
  }
};