/**
 * Routes cho quản lý thanh toán
 * Định nghĩa các endpoints API liên quan đến thanh toán
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   POST /api/payments/create-payment-intent
 * @desc    Tạo payment intent cho thanh toán online
 * @access  Private
 */
router.post('/create-payment-intent', isAuthenticated, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      throw new AppError('Mã đơn hàng là bắt buộc.', 400);
    }
    
    // Kiểm tra đơn hàng
    const orderResult = await pool.query(
      'SELECT id, order_number, total, payment_status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.session.userId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new AppError('Đơn hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    const order = orderResult.rows[0];
    
    // Kiểm tra trạng thái thanh toán
    if (order.payment_status === 'paid') {
      throw new AppError('Đơn hàng này đã được thanh toán.', 400);
    }
    
    // Tạo payment intent (Mock API cho demo)
    // Trong thực tế, bạn sẽ sử dụng SDK của cổng thanh toán như Stripe, VNPay, Momo,...
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: order.total,
      currency: 'vnd',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2)}`
    };
    
    // Lưu thông tin payment intent vào database
    await pool.query(
      `INSERT INTO payment_intents (order_id, payment_intent_id, amount, currency, status, client_secret)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [order.id, paymentIntent.id, paymentIntent.amount, paymentIntent.currency, paymentIntent.status, paymentIntent.client_secret]
    );
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/payments/confirm
 * @desc    Xác nhận thanh toán thành công
 * @access  Private
 */
router.post('/confirm', isAuthenticated, async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId || !orderId) {
      throw new AppError('Thông tin thanh toán không đầy đủ.', 400);
    }
    
    // Kiểm tra đơn hàng
    const orderResult = await pool.query(
      'SELECT id, order_number, payment_status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.session.userId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new AppError('Đơn hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    const order = orderResult.rows[0];
    
    // Kiểm tra trạng thái thanh toán
    if (order.payment_status === 'paid') {
      throw new AppError('Đơn hàng này đã được thanh toán.', 400);
    }
    
    // Cập nhật trạng thái payment intent
    await pool.query(
      `UPDATE payment_intents SET status = 'succeeded', updated_at = NOW() WHERE payment_intent_id = $1 AND order_id = $2`,
      [paymentIntentId, orderId]
    );
    
    // Cập nhật trạng thái thanh toán đơn hàng
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [orderId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/payments/cancel
 * @desc    Hủy thanh toán
 * @access  Private
 */
router.post('/cancel', isAuthenticated, async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId || !orderId) {
      throw new AppError('Thông tin thanh toán không đầy đủ.', 400);
    }
    
    // Kiểm tra đơn hàng
    const orderResult = await pool.query(
      'SELECT id, order_number, payment_status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.session.userId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new AppError('Đơn hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    // Cập nhật trạng thái payment intent
    await pool.query(
      `UPDATE payment_intents SET status = 'canceled', updated_at = NOW() WHERE payment_intent_id = $1 AND order_id = $2`,
      [paymentIntentId, orderId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Đã hủy thanh toán.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/payments/methods
 * @desc    Lấy danh sách phương thức thanh toán
 * @access  Public
 */
router.get('/methods', async (req, res, next) => {
  try {
    // Danh sách phương thức thanh toán cố định
    // Trong thực tế, bạn có thể lấy từ database
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        isActive: true,
        order: 1
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản đến tài khoản ngân hàng của chúng tôi',
        isActive: true,
        order: 2,
        bankAccounts: [
          {
            bankName: 'Vietcombank',
            accountNumber: '1234567890',
            accountName: 'YAPEE VIETNAM JSC',
            branch: 'Hồ Chí Minh'
          },
          {
            bankName: 'Techcombank',
            accountNumber: '0987654321',
            accountName: 'YAPEE VIETNAM JSC',
            branch: 'Hà Nội'
          }
        ]
      },
      {
        id: 'momo',
        name: 'Ví điện tử MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        isActive: true,
        order: 3
      },
      {
        id: 'vnpay',
        name: 'VNPAY',
        description: 'Thanh toán qua cổng VNPAY',
        isActive: true,
        order: 4
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Thanh toán qua ví ZaloPay',
        isActive: true,
        order: 5
      }
    ];
    
    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/payments/shipping-methods
 * @desc    Lấy danh sách phương thức vận chuyển
 * @access  Public
 */
router.get('/shipping-methods', async (req, res, next) => {
  try {
    // Danh sách phương thức vận chuyển cố định
    // Trong thực tế, bạn có thể lấy từ database
    const shippingMethods = [
      {
        id: 'standard',
        name: 'Vận chuyển tiêu chuẩn',
        description: 'Giao hàng trong 3-5 ngày làm việc',
        price: 30000,
        isActive: true,
        order: 1
      },
      {
        id: 'express',
        name: 'Vận chuyển nhanh',
        description: 'Giao hàng trong 1-2 ngày làm việc',
        price: 50000,
        isActive: true,
        order: 2
      },
      {
        id: 'same_day',
        name: 'Giao hàng trong ngày',
        description: 'Chỉ áp dụng cho khu vực nội thành Hà Nội và TP.HCM',
        price: 80000,
        isActive: true,
        order: 3
      }
    ];
    
    res.status(200).json({
      success: true,
      data: shippingMethods
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Lấy lịch sử giao dịch (Admin only)
 * @access  Private - Admin only
 */
router.get('/transactions', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn cơ sở
    let query = `
      SELECT p.id, p.payment_intent_id, p.order_id, o.order_number, 
             p.amount, p.currency, p.status, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.email
      FROM payment_intents p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    if (status) {
      queryParams.push(status);
      query += ` WHERE p.status = $${queryParams.length}`;
    }
    
    // Thêm phần đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalTransactions = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTransactions / limit);
    
    // Thêm phần sắp xếp và phân trang
    query += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực thi truy vấn
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalTransactions,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;