/**
 * Routes cho quản lý hình ảnh sản phẩm
 * Định nghĩa các endpoints API liên quan đến hình ảnh sản phẩm
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/products/:productId/images
 * @desc    Lấy tất cả hình ảnh của một sản phẩm
 * @access  Public
 */
router.get('/products/:productId/images', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Kiểm tra sản phẩm tồn tại
    const productExists = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productExists.rows.length === 0) {
      throw new AppError('Sản phẩm không tồn tại.', 404);
    }
    
    // Lấy danh sách hình ảnh
    const result = await pool.query(`
      SELECT id, product_id, image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, sort_order ASC
    `, [productId]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/products/:productId/images/:imageId
 * @desc    Lấy chi tiết một hình ảnh của sản phẩm
 * @access  Public
 */
router.get('/products/:productId/images/:imageId', async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    
    // Lấy chi tiết hình ảnh
    const result = await pool.query(`
      SELECT id, product_id, image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE id = $1 AND product_id = $2
    `, [imageId, productId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Hình ảnh không tồn tại hoặc không thuộc sản phẩm này.', 404);
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
 * @route   POST /api/products/:productId/images
 * @desc    Thêm hình ảnh mới cho sản phẩm
 * @access  Private - Admin only
 */
router.post('/products/:productId/images', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { image_url, alt_text, is_primary } = req.body;
    
    if (!image_url) {
      throw new AppError('URL hình ảnh là bắt buộc.', 400);
    }
    
    // Kiểm tra sản phẩm tồn tại
    const productExists = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productExists.rows.length === 0) {
      throw new AppError('Sản phẩm không tồn tại.', 404);
    }
    
    // Nếu hình ảnh là primary, cập nhật tất cả hình ảnh khác thành không primary
    if (is_primary) {
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1',
        [productId]
      );
    }
    
    // Xác định sort_order cao nhất hiện tại
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM product_images WHERE product_id = $1',
      [productId]
    );
    
    const sortOrder = parseInt(orderResult.rows[0].max_order) + 1;
    
    // Thêm hình ảnh mới
    const result = await pool.query(`
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [productId, image_url, alt_text || null, is_primary || false, sortOrder]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/products/:productId/images/:imageId
 * @desc    Cập nhật hình ảnh sản phẩm
 * @access  Private - Admin only
 */
router.put('/products/:productId/images/:imageId', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    const { image_url, alt_text, is_primary, sort_order } = req.body;
    
    // Kiểm tra hình ảnh tồn tại và thuộc sản phẩm
    const imageExists = await pool.query(
      'SELECT id FROM product_images WHERE id = $1 AND product_id = $2',
      [imageId, productId]
    );
    
    if (imageExists.rows.length === 0) {
      throw new AppError('Hình ảnh không tồn tại hoặc không thuộc sản phẩm này.', 404);
    }
    
    // Nếu hình ảnh là primary, cập nhật tất cả hình ảnh khác thành không primary
    if (is_primary) {
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1 AND id != $2',
        [productId, imageId]
      );
    }
    
    // Cập nhật hình ảnh
    const result = await pool.query(`
      UPDATE product_images
      SET image_url = COALESCE($1, image_url),
          alt_text = COALESCE($2, alt_text),
          is_primary = COALESCE($3, is_primary),
          sort_order = COALESCE($4, sort_order)
      WHERE id = $5 AND product_id = $6
      RETURNING *
    `, [image_url, alt_text, is_primary, sort_order, imageId, productId]);
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/products/:productId/images/:imageId
 * @desc    Xóa hình ảnh sản phẩm
 * @access  Private - Admin only
 */
router.delete('/products/:productId/images/:imageId', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    
    // Kiểm tra hình ảnh tồn tại và thuộc sản phẩm
    const imageResult = await pool.query(
      'SELECT * FROM product_images WHERE id = $1 AND product_id = $2',
      [imageId, productId]
    );
    
    if (imageResult.rows.length === 0) {
      throw new AppError('Hình ảnh không tồn tại hoặc không thuộc sản phẩm này.', 404);
    }
    
    const image = imageResult.rows[0];
    
    // Nếu xóa hình ảnh primary, đặt hình ảnh khác làm primary
    if (image.is_primary) {
      const nextPrimaryResult = await pool.query(
        'SELECT id FROM product_images WHERE product_id = $1 AND id != $2 ORDER BY sort_order ASC LIMIT 1',
        [productId, imageId]
      );
      
      if (nextPrimaryResult.rows.length > 0) {
        await pool.query(
          'UPDATE product_images SET is_primary = true WHERE id = $1',
          [nextPrimaryResult.rows[0].id]
        );
      }
    }
    
    // Xóa hình ảnh
    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);
    
    res.status(200).json({
      success: true,
      message: 'Hình ảnh sản phẩm đã được xóa thành công.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/products/:productId/images/reorder
 * @desc    Sắp xếp lại thứ tự các hình ảnh
 * @access  Private - Admin only
 */
router.put('/products/:productId/images/reorder', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { imageOrder } = req.body;
    
    if (!Array.isArray(imageOrder)) {
      throw new AppError('imageOrder phải là một mảng các ID hình ảnh.', 400);
    }
    
    // Kiểm tra sản phẩm tồn tại
    const productExists = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productExists.rows.length === 0) {
      throw new AppError('Sản phẩm không tồn tại.', 404);
    }
    
    // Kiểm tra tất cả các ID hình ảnh thuộc sản phẩm
    const imagesResult = await pool.query(
      'SELECT id FROM product_images WHERE product_id = $1',
      [productId]
    );
    
    const validImageIds = imagesResult.rows.map(row => row.id);
    
    // Kiểm tra các ID trong imageOrder đều tồn tại
    const invalidIds = imageOrder.filter(id => !validImageIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new AppError(`Các ID hình ảnh không hợp lệ: ${invalidIds.join(', ')}`, 400);
    }
    
    // Cập nhật sort_order cho từng hình ảnh
    for (let i = 0; i < imageOrder.length; i++) {
      await pool.query(
        'UPDATE product_images SET sort_order = $1 WHERE id = $2',
        [i + 1, imageOrder[i]]
      );
    }
    
    // Lấy danh sách hình ảnh sau khi sắp xếp
    const result = await pool.query(`
      SELECT id, product_id, image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY sort_order ASC
    `, [productId]);
    
    res.status(200).json({
      success: true,
      message: 'Đã sắp xếp lại thứ tự hình ảnh.',
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
