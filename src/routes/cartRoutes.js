/**
 * Routes cho quản lý giỏ hàng
 * Định nghĩa các endpoints API liên quan đến giỏ hàng
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/cart
 * @desc    Lấy thông tin giỏ hàng của người dùng đang đăng nhập
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    // Lấy các mục giỏ hàng của người dùng
    const cartQuery = `
      SELECT c.id, c.product_id, c.quantity, c.variant, c.created_at,
             p.name, p.slug, p.price, p.sale_price, p.image_url, p.stock_quantity
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    
    const cartResult = await pool.query(cartQuery, [req.session.userId]);
    
    // Tính toán tổng tiền
    let subtotal = 0;
    const cartItems = cartResult.rows.map(item => {
      const price = item.sale_price || item.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item,
        price: Number(item.price),
        sale_price: item.sale_price ? Number(item.sale_price) : null,
        current_price: Number(price),
        total: itemTotal
      };
    });
    
    res.status(200).json({
      success: true,
      count: cartItems.length,
      subtotal,
      data: cartItems
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/cart
 * @desc    Thêm sản phẩm vào giỏ hàng
 * @access  Private
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { product_id, quantity = 1, variant = null } = req.body;
    
    if (!product_id) {
      throw new AppError('ID sản phẩm là bắt buộc.', 400);
    }
    
    if (quantity <= 0) {
      throw new AppError('Số lượng phải lớn hơn 0.', 400);
    }
    
    // Kiểm tra sản phẩm có tồn tại và đang còn hàng
    const productQuery = 'SELECT id, name, stock_quantity FROM products WHERE id = $1 AND is_active = true';
    const productResult = await pool.query(productQuery, [product_id]);
    
    if (productResult.rows.length === 0) {
      throw new AppError('Sản phẩm không tồn tại hoặc không còn được bán.', 404);
    }
    
    const product = productResult.rows[0];
    
    // Kiểm tra số lượng còn hàng
    if (quantity > product.stock_quantity) {
      throw new AppError(`Chỉ còn ${product.stock_quantity} sản phẩm trong kho.`, 400);
    }
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemQuery = 'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND variant = $3';
    const existingItemResult = await pool.query(existingItemQuery, [req.session.userId, product_id, variant]);
    
    let result;
    if (existingItemResult.rows.length > 0) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantity + quantity;
      
      // Kiểm tra lại số lượng sau khi cộng thêm
      if (newQuantity > product.stock_quantity) {
        throw new AppError(`Tổng số lượng vượt quá số lượng còn trong kho (${product.stock_quantity}).`, 400);
      }
      
      result = await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.id]
      );
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      result = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, variant) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.session.userId, product_id, quantity, variant]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/cart/:id
 * @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access  Private
 */
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      throw new AppError('Số lượng phải lớn hơn 0.', 400);
    }
    
    // Kiểm tra xem mục giỏ hàng có tồn tại và thuộc về người dùng không
    const cartItemQuery = `
      SELECT c.id, c.product_id, c.quantity, p.stock_quantity, p.name
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = $1 AND c.user_id = $2
    `;
    
    const cartItemResult = await pool.query(cartItemQuery, [id, req.session.userId]);
    
    if (cartItemResult.rows.length === 0) {
      throw new AppError('Mục giỏ hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    const cartItem = cartItemResult.rows[0];
    
    // Kiểm tra số lượng còn hàng
    if (quantity > cartItem.stock_quantity) {
      throw new AppError(`Chỉ còn ${cartItem.stock_quantity} sản phẩm trong kho.`, 400);
    }
    
    // Cập nhật số lượng
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/cart/:id
 * @desc    Xóa sản phẩm khỏi giỏ hàng
 * @access  Private
 */
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem mục giỏ hàng có tồn tại và thuộc về người dùng không
    const cartItemResult = await pool.query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    
    if (cartItemResult.rows.length === 0) {
      throw new AppError('Mục giỏ hàng không tồn tại hoặc không thuộc về bạn.', 404);
    }
    
    // Xóa mục giỏ hàng
    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    Xóa toàn bộ giỏ hàng
 * @access  Private
 */
router.delete('/', isAuthenticated, async (req, res, next) => {
  try {
    // Xóa tất cả mục giỏ hàng của người dùng
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.session.userId]);
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/cart/count
 * @desc    Lấy số lượng sản phẩm trong giỏ hàng
 * @access  Private
 */
router.get('/count', isAuthenticated, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as item_count, SUM(quantity) as total_quantity FROM cart_items WHERE user_id = $1',
      [req.session.userId]
    );
    
    const { item_count, total_quantity } = result.rows[0];
    
    res.status(200).json({
      success: true,
      data: {
        itemCount: parseInt(item_count) || 0,
        totalQuantity: parseInt(total_quantity) || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;