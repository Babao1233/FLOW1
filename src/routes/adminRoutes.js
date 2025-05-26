/**
 * Routes cho quản trị viên
 * Định nghĩa các endpoints API dành riêng cho admin
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * Middleware kiểm tra quyền admin
 * Tất cả các route trong admin đều yêu cầu đăng nhập và có quyền admin
 */
router.use(isAuthenticated, hasRole('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Lấy thông tin tổng quan cho dashboard
 * @access  Private - Admin only
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    // Tổng số người dùng
    const usersQuery = 'SELECT COUNT(*) FROM users';
    const usersResult = await pool.query(usersQuery);
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    // Tổng số sản phẩm
    const productsQuery = 'SELECT COUNT(*) FROM products';
    const productsResult = await pool.query(productsQuery);
    const totalProducts = parseInt(productsResult.rows[0].count);
    
    // Tổng số đơn hàng
    const ordersQuery = 'SELECT COUNT(*) FROM orders';
    const ordersResult = await pool.query(ordersQuery);
    const totalOrders = parseInt(ordersResult.rows[0].count);
    
    // Doanh thu hôm nay
    const todayRevenueQuery = `
      SELECT COALESCE(SUM(total), 0) as revenue 
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'paid'
    `;
    const todayRevenueResult = await pool.query(todayRevenueQuery);
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].revenue);
    
    // Doanh thu tuần này
    const weekRevenueQuery = `
      SELECT COALESCE(SUM(total), 0) as revenue 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) AND payment_status = 'paid'
    `;
    const weekRevenueResult = await pool.query(weekRevenueQuery);
    const weekRevenue = parseFloat(weekRevenueResult.rows[0].revenue);
    
    // Doanh thu tháng này
    const monthRevenueQuery = `
      SELECT COALESCE(SUM(total), 0) as revenue 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'paid'
    `;
    const monthRevenueResult = await pool.query(monthRevenueQuery);
    const monthRevenue = parseFloat(monthRevenueResult.rows[0].revenue);
    
    // Đơn hàng mới
    const newOrdersQuery = `
      SELECT COUNT(*) 
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    const newOrdersResult = await pool.query(newOrdersQuery);
    const newOrders = parseInt(newOrdersResult.rows[0].count);
    
    // Đơn hàng đang xử lý
    const processingOrdersQuery = `
      SELECT COUNT(*) 
      FROM orders 
      WHERE status = 'processing'
    `;
    const processingOrdersResult = await pool.query(processingOrdersQuery);
    const processingOrders = parseInt(processingOrdersResult.rows[0].count);
    
    // Biểu đồ doanh thu 7 ngày gần nhất
    const last7DaysRevenueQuery = `
      SELECT 
        DATE(created_at) as date, 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as order_count
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '7 days' AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const last7DaysRevenueResult = await pool.query(last7DaysRevenueQuery);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        newOrders,
        processingOrders,
        revenueChart: last7DaysRevenueResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Lấy danh sách người dùng
 * @access  Private - Admin only
 */
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn cơ sở
    let query = `
      SELECT id, username, email, full_name, role, is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (username ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length} OR full_name ILIKE $${queryParams.length})`;
    }
    
    // Thêm điều kiện lọc theo role nếu có
    if (role) {
      queryParams.push(role);
      query += ` AND role = $${queryParams.length}`;
    }
    
    // Thêm phần đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Thêm phần sắp xếp và phân trang
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực thi truy vấn
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalUsers,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Lấy thông tin chi tiết người dùng
 * @access  Private - Admin only
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin người dùng
    const userQuery = `
      SELECT id, username, email, full_name, role, is_active, created_at, last_login,
             (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count,
             (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = users.id AND payment_status = 'paid') as total_spent
      FROM users
      WHERE id = $1
    `;
    
    const userResult = await pool.query(userQuery, [id]);
    
    if (userResult.rows.length === 0) {
      throw new AppError('Người dùng không tồn tại.', 404);
    }
    
    // Lấy địa chỉ của người dùng
    const addressesQuery = `
      SELECT id, full_name, phone, address, ward, district, province, is_default
      FROM shipping_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    
    const addressesResult = await pool.query(addressesQuery, [id]);
    
    // Lấy đơn hàng gần nhất của người dùng
    const recentOrdersQuery = `
      SELECT id, order_number, total, status, payment_status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentOrdersResult = await pool.query(recentOrdersQuery, [id]);
    
    const userData = {
      ...userResult.rows[0],
      addresses: addressesResult.rows,
      recentOrders: recentOrdersResult.rows
    };
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Cập nhật thông tin người dùng
 * @access  Private - Admin only
 */
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, is_active } = req.body;
    
    // Kiểm tra người dùng tồn tại
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    
    if (userExists.rows.length === 0) {
      throw new AppError('Người dùng không tồn tại.', 404);
    }
    
    // Cập nhật thông tin người dùng
    const updateFields = [];
    const updateValues = [];
    
    if (email !== undefined) {
      updateFields.push(`email = $${updateValues.length + 1}`);
      updateValues.push(email);
    }
    
    if (full_name !== undefined) {
      updateFields.push(`full_name = $${updateValues.length + 1}`);
      updateValues.push(full_name);
    }
    
    if (role !== undefined) {
      updateFields.push(`role = $${updateValues.length + 1}`);
      updateValues.push(role);
    }
    
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${updateValues.length + 1}`);
      updateValues.push(is_active);
    }
    
    // Thêm updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // Nếu không có trường nào được cập nhật
    if (updateFields.length === 1) { // Chỉ có updated_at
      throw new AppError('Không có thông tin nào để cập nhật.', 400);
    }
    
    // Cập nhật người dùng
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING id, username, email, full_name, role, is_active, created_at, updated_at
    `;
    
    updateValues.push(id);
    
    const result = await pool.query(updateQuery, updateValues);
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật thông tin người dùng.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/products
 * @desc    Lấy danh sách sản phẩm (bao gồm cả sản phẩm không hiện thị)
 * @access  Private - Admin only
 */
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category_id, is_active } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn cơ sở
    let query = `
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock_quantity, 
             p.is_active, p.is_featured, p.created_at, p.updated_at,
             c.name as category_name, c.id as category_id,
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count,
             (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${queryParams.length} OR p.slug ILIKE $${queryParams.length})`;
    }
    
    // Thêm điều kiện lọc theo danh mục nếu có
    if (category_id) {
      queryParams.push(category_id);
      query += ` AND p.category_id = $${queryParams.length}`;
    }
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    if (is_active !== undefined) {
      queryParams.push(is_active === 'true');
      query += ` AND p.is_active = $${queryParams.length}`;
    }
    
    // Thêm phần đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Thêm phần sắp xếp và phân trang
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực thi truy vấn
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Lấy thống kê bán hàng
 * @access  Private - Admin only
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const { period = 'month', start_date, end_date } = req.query;
    
    let timeFilter;
    let groupBy;
    
    // Xác định khoảng thời gian và cách nhóm
    if (start_date && end_date) {
      // Thời gian tùy chỉnh
      timeFilter = `created_at BETWEEN '${start_date}' AND '${end_date}'`;
      // Nếu khoảng thời gian > 60 ngày thì nhóm theo tuần, ngược lại nhóm theo ngày
      groupBy = `DATE(created_at)`;
    } else {
      // Thời gian mặc định
      switch (period) {
        case 'day':
          timeFilter = `DATE(created_at) = CURRENT_DATE`;
          groupBy = `EXTRACT(HOUR FROM created_at)`;
          break;
        case 'week':
          timeFilter = `created_at >= DATE_TRUNC('week', CURRENT_DATE)`;
          groupBy = `DATE(created_at)`;
          break;
        case 'month':
          timeFilter = `created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
          groupBy = `DATE(created_at)`;
          break;
        case 'year':
          timeFilter = `created_at >= DATE_TRUNC('year', CURRENT_DATE)`;
          groupBy = `DATE_TRUNC('month', created_at)`;
          break;
        default:
          timeFilter = `created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
          groupBy = `DATE(created_at)`;
      }
    }
    
    // Doanh thu theo thời gian
    const revenueQuery = `
      SELECT ${groupBy} as date, 
             COUNT(*) as order_count,
             COALESCE(SUM(total), 0) as revenue,
             COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
      FROM orders
      WHERE ${timeFilter}
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} ASC
    `;
    
    const revenueResult = await pool.query(revenueQuery);
    
    // Sản phẩm bán chạy nhất
    const topProductsQuery = `
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.image_url,
             SUM(op.quantity) as total_quantity,
             COUNT(DISTINCT o.id) as order_count,
             SUM(op.price * op.quantity) as total_revenue
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      JOIN orders o ON op.order_id = o.id
      WHERE ${timeFilter} AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.slug, p.price, p.sale_price, p.image_url
      ORDER BY total_quantity DESC
      LIMIT 10
    `;
    
    const topProductsResult = await pool.query(topProductsQuery);
    
    // Danh mục bán chạy nhất
    const topCategoriesQuery = `
      SELECT c.id, c.name, c.slug,
             COUNT(DISTINCT o.id) as order_count,
             SUM(op.quantity) as total_quantity,
             SUM(op.price * op.quantity) as total_revenue
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      JOIN product_categories c ON p.category_id = c.id
      JOIN orders o ON op.order_id = o.id
      WHERE ${timeFilter} AND o.status != 'cancelled'
      GROUP BY c.id, c.name, c.slug
      ORDER BY total_revenue DESC
      LIMIT 5
    `;
    
    const topCategoriesResult = await pool.query(topCategoriesQuery);
    
    // Thống kê đơn hàng theo trạng thái
    const orderStatusQuery = `
      SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as total_value
      FROM orders
      WHERE ${timeFilter}
      GROUP BY status
      ORDER BY count DESC
    `;
    
    const orderStatusResult = await pool.query(orderStatusQuery);
    
    res.status(200).json({
      success: true,
      data: {
        revenue: revenueResult.rows,
        topProducts: topProductsResult.rows,
        topCategories: topCategoriesResult.rows,
        orderStatus: orderStatusResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;