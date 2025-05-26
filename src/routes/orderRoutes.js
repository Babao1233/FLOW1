/**
 * Routes cho quản lý đơn hàng
 * Định nghĩa các endpoints API liên quan đến đơn hàng
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/orders
 * @desc    Lấy danh sách đơn hàng của người dùng đang đăng nhập
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn cơ sở
    let query = `
      SELECT o.id, o.order_number, o.status, o.total, o.created_at,
             o.payment_status, o.payment_method, o.shipping_method
      FROM orders o
      WHERE o.user_id = $1
    `;
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    const queryParams = [req.session.userId];
    if (status) {
      query += ` AND o.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    // Thêm phần đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalOrders = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Thêm phần sắp xếp và phân trang
    query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực thi truy vấn
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalOrders,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Lấy chi tiết đơn hàng
 * @access  Private
 */
router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin đơn hàng và các sản phẩm trong đơn hàng
    const query = `
      SELECT o.id, o.order_number, o.status, o.total, o.subtotal, o.discount, 
             o.shipping_fee, o.payment_status, o.payment_method, o.shipping_method,
             o.created_at, o.processed_at, o.shipped_at, o.delivered_at,
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
                 'id', op.id,
                 'productId', p.id,
                 'name', p.name,
                 'price', op.price,
                 'quantity', op.quantity,
                 'total', (op.price * op.quantity),
                 'imageUrl', p.image_url,
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
    
    const result = await pool.query(query, [id, req.session.userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này.', 404);
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/orders
 * @desc    Tạo đơn hàng mới
 * @access  Private
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { 
      products, shippingAddressId, paymentMethod, shippingMethod,
      couponCode, note 
    } = req.body;
    
    // Validate dữ liệu đầu vào
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new AppError('Danh sách sản phẩm không hợp lệ.', 400);
    }
    
    if (!shippingAddressId) {
      throw new AppError('Địa chỉ giao hàng là bắt buộc.', 400);
    }
    
    if (!paymentMethod) {
      throw new AppError('Phương thức thanh toán là bắt buộc.', 400);
    }
    
    if (!shippingMethod) {
      throw new AppError('Phương thức vận chuyển là bắt buộc.', 400);
    }
    
    // Kiểm tra địa chỉ giao hàng
    const addressResult = await pool.query(
      'SELECT id FROM shipping_addresses WHERE id = $1 AND user_id = $2',
      [shippingAddressId, req.session.userId]
    );
    
    if (addressResult.rows.length === 0) {
      throw new AppError('Địa chỉ giao hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    // Bắt đầu transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Tạo mã đơn hàng
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Tính toán chi phí đơn hàng
      let subtotal = 0;
      let discount = 0;
      let shippingFee = 30000; // Phí ship mặc định
      
      // Lấy thông tin chi tiết và kiểm tra tồn kho của các sản phẩm
      const productDetails = [];
      for (const item of products) {
        const productResult = await client.query(
          'SELECT id, name, price, sale_price, stock_quantity FROM products WHERE id = $1 AND is_active = true',
          [item.productId]
        );
        
        if (productResult.rows.length === 0) {
          throw new AppError(`Sản phẩm với ID ${item.productId} không tồn tại hoặc không còn được bán.`, 400);
        }
        
        const product = productResult.rows[0];
        
        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Sản phẩm ${product.name} chỉ còn ${product.stock_quantity} trong kho.`, 400);
        }
        
        // Lưu thông tin chi tiết sản phẩm
        const price = product.sale_price || product.price;
        productDetails.push({
          productId: product.id,
          price,
          quantity: item.quantity,
          variant: item.variant || null
        });
        
        // Cộng dồn giá trị đơn hàng
        subtotal += price * item.quantity;
      }
      
      // Xử lý mã giảm giá nếu có
      if (couponCode) {
        const couponResult = await client.query(
          `SELECT id, discount_type, discount_value, min_order_value 
           FROM coupons 
           WHERE code = $1 AND is_active = true 
           AND (usage_limit IS NULL OR usage_count < usage_limit)
           AND (expires_at IS NULL OR expires_at > NOW())`,
          [couponCode]
        );
        
        if (couponResult.rows.length > 0) {
          const coupon = couponResult.rows[0];
          
          // Kiểm tra giá trị đơn hàng tối thiểu
          if (subtotal >= coupon.min_order_value) {
            if (coupon.discount_type === 'percentage') {
              discount = subtotal * (coupon.discount_value / 100);
            } else if (coupon.discount_type === 'fixed') {
              discount = coupon.discount_value;
            }
            
            // Cập nhật số lần sử dụng mã giảm giá
            await client.query(
              'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1',
              [coupon.id]
            );
          }
        }
      }
      
      // Tính tổng giá trị đơn hàng
      const total = subtotal - discount + shippingFee;
      
      // Tạo đơn hàng mới
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, status, total, subtotal, discount, shipping_fee,
          payment_status, payment_method, shipping_method, shipping_address_id, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          req.session.userId, orderNumber, 'pending', total, subtotal, discount, shippingFee,
          'pending', paymentMethod, shippingMethod, shippingAddressId, note || ''
        ]
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Thêm chi tiết sản phẩm vào đơn hàng
      for (const item of productDetails) {
        await client.query(
          `INSERT INTO order_products (order_id, product_id, price, quantity, variant)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.price, item.quantity, item.variant]
        );
        
        // Cập nhật số lượng tồn kho
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: {
          orderId,
          orderNumber
        }
      });
    } catch (err) {
      // Rollback nếu có lỗi
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Giải phóng client
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Hủy đơn hàng
 * @access  Private
 */
router.patch('/:id/cancel', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      throw new AppError('Vui lòng cung cấp lý do hủy đơn hàng.', 400);
    }
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng không và có thể hủy không
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
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
      [reason, id, req.session.userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/admin/all
 * @desc    Lấy danh sách tất cả đơn hàng (chỉ admin)
 * @access  Private - Admin only
 */
router.get('/admin/all', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Xây dựng câu truy vấn cơ sở
    let query = `
      SELECT o.id, o.order_number, o.status, o.total, o.created_at,
             o.payment_status, o.payment_method, o.shipping_method,
             u.username, u.email, u.full_name as user_fullname
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Thêm điều kiện lọc theo trạng thái nếu có
    if (status) {
      queryParams.push(status);
      query += ` AND o.status = $${queryParams.length}`;
    }
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (o.order_number ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length} OR u.full_name ILIKE $${queryParams.length})`;
    }
    
    // Thêm phần đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalOrders = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Thêm phần sắp xếp và phân trang
    query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực thi truy vấn
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalOrders,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Cập nhật trạng thái đơn hàng (chỉ admin)
 * @access  Private - Admin only
 */
router.patch('/:id/status', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}.`, 400);
    }
    
    // Kiểm tra xem đơn hàng có tồn tại không
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Đơn hàng không tồn tại.', 404);
    }
    
    // Xây dựng câu lệnh cập nhật
    let updateFields = [`status = '${status}'`, 'updated_at = NOW()'];
    const queryParams = [id];
    
    // Thêm note nếu có
    if (note) {
      queryParams.push(note);
      updateFields.push(`admin_note = $2`);
    }
    
    // Thêm các trường thời gian tương ứng với trạng thái
    if (status === 'processing') {
      updateFields.push('processed_at = NOW()');
    } else if (status === 'shipped') {
      updateFields.push('shipped_at = NOW()');
    } else if (status === 'delivered') {
      updateFields.push('delivered_at = NOW()');
    } else if (status === 'cancelled') {
      updateFields.push('cancelled_at = NOW()');
    } else if (status === 'refunded') {
      updateFields.push('refunded_at = NOW()');
    }
    
    // Thực hiện cập nhật
    const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;