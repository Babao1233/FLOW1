require('dotenv').config(); // Moved to the top
const express = require('express');
const pool = require('./database'); // Changed client to pool
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); // Corrected morgan require
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs'); // Added bcryptjs

// Import logger và middleware xử lý lỗi
const logger = require('./src/utils/logger');
const { notFoundHandler, authenticationErrorHandler, authorizationErrorHandler, validationErrorHandler, databaseErrorHandler, globalErrorHandler, AppError } = require('./src/middleware/errorHandler');

// Import middleware bảo mật
const { securityHeaders, bruteForceProtection, csrfProtection, requestSizeLimiter, sqlInjectionProtection, corsHandler, headerSanitizer, rateLimiter } = require('./src/middleware/security');
const { contentSecurityPolicy, loginRateLimit, registerRateLimit, passwordResetRateLimit, apiRateLimit } = require('./src/middleware/index');

// Import middleware xác thực
const { isAuthenticated, hasRole, isResourceOwner, apiKeyAuth, sessionTimeout } = require('./src/middleware/auth');

// Import tiện ích mật khẩu
const passwordUtils = require('./src/utils/passwordUtils');

const app = express();

// Middleware bảo mật
app.use(corsHandler); // Thay thế cors() cơ bản bằng corsHandler tùy chỉnh
app.use(morgan('dev'));
app.use(securityHeaders); // Thiết lập các header bảo mật
app.use(contentSecurityPolicy); // Thiết lập Content Security Policy
app.use(requestSizeLimiter); // Giới hạn kích thước request
app.use(headerSanitizer); // Kiểm tra header nhạy cảm
app.use(sqlInjectionProtection); // Bảo vệ chống SQL Injection
app.use(express.static('public')); // Phục vụ tệp tĩnh từ thư mục public
app.use(bodyParser.json({ limit: '1mb' })); // Giới hạn kích thước JSON
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' })); // Giới hạn kích thước form
app.use(apiRateLimit); // Giới hạn tỷ lệ yêu cầu chung

// Session middleware
app.use(session({
  store: new pgSession({
    pool: pool, // Connection pool
    tableName: 'user_sessions' // Optional: customize session table name
  }),
  secret: process.env.SESSION_SECRET || 'yapee-super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true, // Recommended
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax' // Protect against CSRF
  }
}));

// Middleware kiểm tra phiên hết hạn
app.use(sessionTimeout);

// Middleware bảo vệ chống brute force
app.use(bruteForceProtection);

// API endpoints
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const result = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error inserting contact:', err);
    res.status(500).json({ success: false, error: 'Could not save the message' });
  }
});

// Import routes
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const productImageRoutes = require('./src/routes/productImageRoutes');

// Sử dụng routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', productImageRoutes); // Đặt dưới route gốc vì đường dẫn đã bao gồm 'products'

// Middleware xử lý lỗi 404 cho các đường dẫn không tồn tại
app.use((req, res, next) => {
  // Bỏ qua 404 cho các file tĩnh và favicon
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/) || req.path === '/favicon.ico') {
    return next();
  }
  logger.warn(`Đường dẫn không tồn tại: ${req.originalUrl}`);
  next(AppError.notFound(`Không tìm thấy đường dẫn: ${req.originalUrl}`));
});

// Thêm các middleware xử lý lỗi theo thứ tự
app.use(authenticationErrorHandler);
app.use(authorizationErrorHandler);
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(globalErrorHandler);

// Khởi tạo ứng dụng và ghi log
app.on('error', (err) => {
  logger.error('Server error:', err);
});

// Expose các error class và logger cho toàn bộ ứng dụng
app.locals.AppError = AppError;
app.locals.logger = logger;

// --- Authentication API Endpoints ---

// Register endpoint
app.post('/api/auth/register', registerRateLimit, async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    if (!username || !email || !password) {
      throw new AppError('Username, email, và mật khẩu là bắt buộc.', 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Định dạng email không hợp lệ.', 400);
    }
    
    // Validate password strength
    const passwordCheck = passwordUtils.checkPasswordStrength(password);
    if (!passwordCheck.isValid) {
      throw new AppError(
        `Mật khẩu không đủ mạnh. ${passwordCheck.feedback.join(' ')}`, 
        400
      );
    }
    
    // Check if username or email already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (checkResult.rows.length > 0) {
      throw new AppError('Tên người dùng hoặc email đã tồn tại.', 409);
    }
    
    // Hash password
    const hashedPassword = await passwordUtils.hashPassword(password);
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, username, email, full_name, role, created_at`,
      [username, email, hashedPassword, fullName || username, 'user', true]
    );
    
    logger.info(`Người dùng mới đã đăng ký: ${username} (${email})`);
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
app.post('/api/auth/login', loginRateLimit, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new AppError('Tên người dùng và mật khẩu là bắt buộc.', 400);
    }
    
    // Find user by username
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('Tên người dùng hoặc mật khẩu không đúng.', 401);
    }
    
    const user = result.rows[0];
    
    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (user.is_active === false) {
      throw new AppError('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.', 403);
    }
    
    // Compare passwords
    const isMatch = await passwordUtils.comparePassword(password, user.password_hash);
    
    if (!isMatch) {
      logger.warn(`Đăng nhập thất bại cho người dùng: ${username}`);
      throw new AppError('Tên người dùng hoặc mật khẩu không đúng.', 401);
    }
    
    // Set user session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.lastActive = Date.now();
    
    // Cập nhật thời gian đăng nhập cuối
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    logger.info(`Người dùng đăng nhập thành công: ${username}`);
    
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      throw new AppError('Bạn chưa đăng nhập.', 400);
    }
    
    const username = req.session.username;
    
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        logger.error('Lỗi khi đăng xuất:', err);
        return res.status(500).json({ success: false, message: 'Lỗi khi đăng xuất.' });
      }
      
      logger.info(`Người dùng đăng xuất thành công: ${username}`);
      res.clearCookie('connect.sid');
      res.status(200).json({ success: true, message: 'Đăng xuất thành công.' });
    });
  } catch (err) {
    next(err);
  }
});

// Sử dụng middleware isAuthenticated từ src/middleware/auth.js
// Nếu cần mở rộng, chỉnh sửa trực tiếp trong file auth.js

// API kiểm tra trạng thái đăng nhập
app.get('/api/auth/status', async (req, res, next) => {
  try {
    if (req.session.userId) {
      // Lấy thông tin chi tiết người dùng từ database
      const result = await pool.query(
        'SELECT id, username, email, full_name, role FROM users WHERE id = $1',
        [req.session.userId]
      );
      
      if (result.rows.length === 0) {
        // Xóa phiên nếu không tìm thấy người dùng
        req.session.destroy();
        return res.status(200).json({ loggedIn: false });
      }
      
      const user = result.rows[0];
      
      return res.status(200).json({
        loggedIn: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    }
    
    res.status(200).json({ loggedIn: false });
  } catch (err) {
    next(err);
  }
});

// API đặt lại mật khẩu (không yêu cầu đăng nhập)
app.post('/api/auth/request-reset', passwordResetRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Email là bắt buộc.', 400);
    }
    
    // Kiểm tra xem email có tồn tại trong hệ thống không
    const result = await pool.query(
      'SELECT id, email, username FROM users WHERE email = $1',
      [email]
    );
    
    // Nếu không tìm thấy email, vẫn trả về thành công để tránh lộ thông tin
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
      });
    }
    
    const user = result.rows[0];
    
    // Tạo token ngẫu nhiên
    const token = require('crypto').randomBytes(32).toString('hex');
    
    // Lưu token vào cơ sở dữ liệu với thời hạn 1 giờ
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
    
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );
    
    // Gửi email (trong thực tế sẽ sử dụng dịch vụ gửi email)
    console.log(`[Mô phỏng gửi email] Gửi link đặt lại mật khẩu đến ${email} với token: ${token}`);
    
    res.status(200).json({
      success: true,
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.'
    });
  } catch (err) {
    next(err);
  }
});

// API đổi mật khẩu (yêu cầu đăng nhập)
app.post('/api/auth/change-password', isAuthenticated, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Mật khẩu hiện tại và mật khẩu mới là bắt buộc.', 400);
    }
    
    // Kiểm tra độ mạnh mật khẩu mới
    const passwordCheck = passwordUtils.checkPasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      throw new AppError(
        `Mật khẩu không đủ mạnh. ${passwordCheck.feedback.join(' ')}`, 
        400
      );
    }
    
    // Lấy thông tin người dùng hiện tại
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      throw new AppError('Không tìm thấy người dùng.', 404);
    }
    
    const user = userResult.rows[0];
    
    // Xác thực mật khẩu hiện tại
    const isMatch = await passwordUtils.comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không chính xác.', 401);
    }
    
    // Ngăn chặn sử dụng lại mật khẩu cũ
    const isSamePassword = await passwordUtils.comparePassword(newPassword, user.password_hash);
    if (isSamePassword) {
      throw new AppError('Mật khẩu mới không được trùng với mật khẩu hiện tại.', 400);
    }
    
    // Tạo hash mật khẩu mới
    const newPasswordHash = await passwordUtils.hashPassword(newPassword);
    
    // Cập nhật mật khẩu
    await pool.query(
      'UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2', 
      [newPasswordHash, req.user.id]
    );
    
    logger.info(`Người dùng ${req.user.username} đã thay đổi mật khẩu`);
    
    res.status(200).json({ 
      success: true,
      message: 'Đổi mật khẩu thành công.' 
    });
  } catch (err) {
    next(err);
  }
});

// --- User Account Management API Endpoints ---

// API lấy thông tin hồ sơ người dùng
app.get('/api/user/profile', isAuthenticated, async (req, res, next) => {
  try {
    // Lấy thông tin chi tiết từ database
    const result = await pool.query(
      `SELECT id, username, email, full_name, phone, avatar_url, 
      created_at, last_login, user_settings, role
      FROM users WHERE id = $1`,
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('Không tìm thấy thông tin người dùng.', 404);
    }
    
    const user = result.rows[0];
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        settings: user.user_settings,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// API cập nhật thông tin hồ sơ
app.put('/api/user/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { fullName, phone, email } = req.body;
    
    // Validate thông tin cơ bản
    if (!fullName) {
      throw new AppError('Họ và tên là bắt buộc.', 400);
    }
    
    if (email) {
      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Định dạng email không hợp lệ.', 400);
      }
      
      // Kiểm tra xem email đã tồn tại chưa
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.session.userId]
      );
      
      if (existingEmail.rows.length > 0) {
        throw new AppError('Email này đã được sử dụng bởi tài khoản khác.', 400);
      }
    }
    
    // Cập nhật thông tin người dùng
    const updateFields = [];
    const updateValues = [];
    let valueIndex = 1;
    
    if (fullName) {
      updateFields.push(`full_name = $${valueIndex}`);
      updateValues.push(fullName);
      valueIndex++;
    }
    
    if (phone) {
      updateFields.push(`phone = $${valueIndex}`);
      updateValues.push(phone);
      valueIndex++;
    }
    
    if (email) {
      updateFields.push(`email = $${valueIndex}`);
      updateValues.push(email);
      valueIndex++;
    }
    
    updateFields.push(`updated_at = NOW()`);
    
    // Thêm userId vào cuối mảng updateValues
    updateValues.push(req.session.userId);
    
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${valueIndex} 
      RETURNING id, username, email, full_name, phone, avatar_url
    `;
    
    const result = await pool.query(query, updateValues);
    
    if (result.rows.length === 0) {
      throw new AppError('Không thể cập nhật thông tin người dùng.', 500);
    }
    
    const updatedUser = result.rows[0];
    
    logger.info(`Người dùng ${updatedUser.username} đã cập nhật thông tin hồ sơ`);
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- User Address Management API Endpoints ---

// API lấy danh sách địa chỉ của người dùng
app.get('/api/user/addresses', isAuthenticated, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, phone, address, ward, district, province, is_default, created_at, updated_at
       FROM user_addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [req.session.userId]
    );
    
    res.status(200).json({
      success: true,
      addresses: result.rows.map(addr => ({
        id: addr.id,
        fullName: addr.full_name,
        phone: addr.phone,
        address: addr.address,
        ward: addr.ward,
        district: addr.district,
        province: addr.province,
        isDefault: addr.is_default,
        createdAt: addr.created_at,
        updatedAt: addr.updated_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

// API thêm địa chỉ mới
app.post('/api/user/addresses', isAuthenticated, async (req, res, next) => {
  try {
    const { fullName, phone, address, ward, district, province, isDefault } = req.body;
    
    // Validate thông tin địa chỉ
    if (!fullName || !phone || !address || !district || !province) {
      throw new AppError('Vui lòng điền đầy đủ thông tin địa chỉ.', 400);
    }
    
    // Validate số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      throw new AppError('Số điện thoại không hợp lệ.', 400);
    }
    
    // Bắt đầu transaction
    await pool.query('BEGIN');
    
    // Nếu đây là địa chỉ mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [req.session.userId]
      );
    }
    
    // Thêm địa chỉ mới
    const result = await pool.query(
      `INSERT INTO user_addresses (
        user_id, full_name, phone, address, ward, district, province, is_default, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, full_name, phone, address, ward, district, province, is_default, created_at`,
      [
        req.session.userId,
        fullName,
        phone,
        address,
        ward || '',
        district,
        province,
        isDefault || false
      ]
    );
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const newAddress = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công.',
      address: {
        id: newAddress.id,
        fullName: newAddress.full_name,
        phone: newAddress.phone,
        address: newAddress.address,
        ward: newAddress.ward,
        district: newAddress.district,
        province: newAddress.province,
        isDefault: newAddress.is_default,
        createdAt: newAddress.created_at
      }
    });
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await pool.query('ROLLBACK');
    next(err);
  }
});

// API cập nhật địa chỉ
app.put('/api/user/addresses/:id', isAuthenticated, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const { fullName, phone, address, ward, district, province, isDefault } = req.body;
    
    // Validate thông tin địa chỉ
    if (!fullName || !phone || !address || !district || !province) {
      throw new AppError('Vui lòng điền đầy đủ thông tin địa chỉ.', 400);
    }
    
    // Validate số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      throw new AppError('Số điện thoại không hợp lệ.', 400);
    }
    
    // Kiểm tra xem địa chỉ có thuộc về người dùng hiện tại không
    const checkResult = await pool.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, req.session.userId]
    );
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Không tìm thấy địa chỉ hoặc bạn không có quyền cập nhật địa chỉ này.', 404);
    }
    
    // Bắt đầu transaction
    await pool.query('BEGIN');
    
    // Nếu đây là địa chỉ mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND id != $2',
        [req.session.userId, addressId]
      );
    }
    
    // Cập nhật địa chỉ
    const result = await pool.query(
      `UPDATE user_addresses SET
        full_name = $1,
        phone = $2,
        address = $3,
        ward = $4,
        district = $5,
        province = $6,
        is_default = $7,
        updated_at = NOW()
      WHERE id = $8 AND user_id = $9
      RETURNING id, full_name, phone, address, ward, district, province, is_default, updated_at`,
      [
        fullName,
        phone,
        address,
        ward || '',
        district,
        province,
        isDefault || false,
        addressId,
        req.session.userId
      ]
    );
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const updatedAddress = result.rows[0];
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật địa chỉ thành công.',
      address: {
        id: updatedAddress.id,
        fullName: updatedAddress.full_name,
        phone: updatedAddress.phone,
        address: updatedAddress.address,
        ward: updatedAddress.ward,
        district: updatedAddress.district,
        province: updatedAddress.province,
        isDefault: updatedAddress.is_default,
        updatedAt: updatedAddress.updated_at
      }
    });
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await pool.query('ROLLBACK');
    next(err);
  }
});

// API xóa địa chỉ
app.delete('/api/user/addresses/:id', isAuthenticated, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    
    // Kiểm tra xem địa chỉ có thuộc về người dùng hiện tại không
    const checkResult = await pool.query(
      'SELECT id, is_default FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, req.session.userId]
    );
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Không tìm thấy địa chỉ hoặc bạn không có quyền xóa địa chỉ này.', 404);
    }
    
    // Không cho phép xóa địa chỉ mặc định
    if (checkResult.rows[0].is_default) {
      throw new AppError('Không thể xóa địa chỉ mặc định. Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa.', 400);
    }
    
    // Xóa địa chỉ
    await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, req.session.userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Xóa địa chỉ thành công.'
    });
  } catch (err) {
    next(err);
  }
});

// API đặt địa chỉ mặc định
app.patch('/api/user/addresses/:id/set-default', isAuthenticated, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    
    // Kiểm tra xem địa chỉ có thuộc về người dùng hiện tại không
    const checkResult = await pool.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, req.session.userId]
    );
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Không tìm thấy địa chỉ hoặc bạn không có quyền cập nhật địa chỉ này.', 404);
    }
    
    // Bắt đầu transaction
    await pool.query('BEGIN');
    
    // Đặt tất cả địa chỉ thành không mặc định
    await pool.query(
      'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
      [req.session.userId]
    );
    
    // Đặt địa chỉ được chọn thành mặc định
    const result = await pool.query(
      `UPDATE user_addresses SET
        is_default = true,
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, full_name, phone, address, ward, district, province, is_default, updated_at`,
      [addressId, req.session.userId]
    );
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const updatedAddress = result.rows[0];
    
    res.status(200).json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công.',
      address: {
        id: updatedAddress.id,
        fullName: updatedAddress.full_name,
        phone: updatedAddress.phone,
        address: updatedAddress.address,
        ward: updatedAddress.ward,
        district: updatedAddress.district,
        province: updatedAddress.province,
        isDefault: updatedAddress.is_default,
        updatedAt: updatedAddress.updated_at
      }
    });
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await pool.query('ROLLBACK');
    next(err);
  }
});

// --- Order Management API Endpoints ---

// API lấy danh sách đơn hàng của người dùng
app.get('/api/user/orders', isAuthenticated, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.id, o.order_number, o.status, o.total, o.created_at as order_date, 
             o.shipping_fee, o.discount, o.payment_status, o.payment_method, 
             json_agg(
               json_build_object(
                 'id', op.product_id,
                 'name', p.name,
                 'price', op.price,
                 'quantity', op.quantity,
                 'image_url', p.image_url,
                 'variant', op.variant
               )
             ) as products
      FROM orders o
      JOIN order_products op ON o.id = op.order_id
      JOIN products p ON op.product_id = p.id
      WHERE o.user_id = $1
    `;
    
    const queryParams = [req.session.userId];
    let paramIndex = 2;
    
    if (status && status !== 'all') {
      query += ` AND o.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    query += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, queryParams);
    
    // Đếm tổng số đơn hàng để phân trang
    let countQuery = 'SELECT COUNT(*) FROM orders WHERE user_id = $1';
    const countParams = [req.session.userId];
    
    if (status && status !== 'all') {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalOrders = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.status(200).json({
      success: true,
      orders: result.rows,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// API lấy chi tiết đơn hàng
app.get('/api/user/orders/:id', isAuthenticated, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    
    // Lấy thông tin đơn hàng
    const orderQuery = `
      SELECT o.id, o.order_number, o.status, o.total, o.subtotal, o.discount, 
             o.shipping_fee, o.payment_status, o.payment_method, o.shipping_method,
             o.created_at as order_date, o.processed_at as processing_date,
             o.shipped_at as shipping_date, o.delivered_at as delivery_date,
             json_build_object(
               'id', sa.id,
               'fullName', sa.full_name,
               'phone', sa.phone,
               'address', sa.address,
               'ward', sa.ward,
               'district', sa.district,
               'province', sa.province
             ) as shipping_address,
             json_agg(
               json_build_object(
                 'id', op.product_id,
                 'name', p.name,
                 'price', op.price,
                 'quantity', op.quantity,
                 'image_url', p.image_url,
                 'variant', op.variant
               )
             ) as products
      FROM orders o
      JOIN shipping_addresses sa ON o.shipping_address_id = sa.id
      JOIN order_products op ON o.id = op.order_id
      JOIN products p ON op.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, sa.id
    `;
    
    const result = await pool.query(orderQuery, [orderId, req.session.userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.', 404);
    }
    
    res.status(200).json({
      success: true,
      order: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// API hủy đơn hàng
app.patch('/api/user/orders/:id/cancel', isAuthenticated, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    
    if (!reason) {
      throw new AppError('Vui lòng cung cấp lý do hủy đơn hàng.', 400);
    }
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng không và có thể hủy không
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.session.userId]
    );
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này.', 404);
    }
    
    const order = checkResult.rows[0];
    
    // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new AppError(`Không thể hủy đơn hàng ở trạng thái ${order.status}.`, 400);
    }
    
    // Cập nhật trạng thái đơn hàng
    await pool.query(
      `UPDATE orders SET 
        status = 'cancelled', 
        cancelled_at = NOW(), 
        cancellation_reason = $1,
        updated_at = NOW()
      WHERE id = $2 AND user_id = $3`,
      [reason, orderId, req.session.userId]
    );
    
    logger.info(`Đơn hàng #${orderId} đã bị hủy bởi người dùng ${req.session.userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công.'
    });
  } catch (err) {
    next(err);
  }
});

// --- End of Order Management API Endpoints ---

// --- End of Authentication API Endpoints ---

// Middleware xử lý lỗi - đặt ở cuối cùng
app.use(notFoundHandler);
app.use(authenticationErrorHandler);
app.use(authorizationErrorHandler);
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server đang chạy trên cổng ${PORT}`);
});