/**
 * Routes cho quản lý đánh giá sản phẩm
 * Định nghĩa các endpoints API liên quan đến đánh giá
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole, isResourceOwner } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Lấy tất cả đánh giá của một sản phẩm
 * @access  Public
 */
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;
    
    // Tính offset cho phân trang
    const offset = (page - 1) * limit;
    
    // Xác định sắp xếp
    let orderBy;
    switch (sort) {
      case 'highest':
        orderBy = 'r.rating DESC';
        break;
      case 'lowest':
        orderBy = 'r.rating ASC';
        break;
      case 'helpful':
        orderBy = 'r.helpful_count DESC';
        break;
      case 'newest':
      default:
        orderBy = 'r.created_at DESC';
    }
    
    // Xây dựng điều kiện lọc theo rating nếu có
    let ratingFilter = '';
    let params = [productId, limit, offset];
    
    if (rating) {
      ratingFilter = 'AND r.rating = $4';
      params.push(rating);
    }
    
    // Truy vấn tổng số đánh giá
    const countQuery = `
      SELECT COUNT(*) 
      FROM product_reviews r
      WHERE r.product_id = $1 ${ratingFilter}
    `;
    
    const countResult = await pool.query(
      countQuery,
      rating ? [productId, rating] : [productId]
    );
    
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Truy vấn danh sách đánh giá
    const query = `
      SELECT 
        r.id, r.product_id, r.user_id, r.rating, r.title, r.content,
        r.created_at, r.updated_at, r.helpful_count, r.verified_purchase,
        u.username, u.full_name,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ri.id,
            'url', ri.image_url
          ))
          FROM review_images ri
          WHERE ri.review_id = r.id), '[]'
        ) as images
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 ${ratingFilter}
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalItems,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/reviews/product/:productId/stats
 * @desc    Lấy thống kê đánh giá của một sản phẩm
 * @access  Public
 */
router.get('/product/:productId/stats', async (req, res, next) => {
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
    
    // Lấy tổng số đánh giá và điểm trung bình
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM product_reviews
      WHERE product_id = $1
    `;
    
    const statsResult = await pool.query(statsQuery, [productId]);
    
    // Lấy số lượng đánh giá cho mỗi sao
    const ratingDistributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM product_reviews
      WHERE product_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const distributionResult = await pool.query(ratingDistributionQuery, [productId]);
    
    // Xây dựng phân phối đánh giá
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    
    distributionResult.rows.forEach(row => {
      distribution[row.rating] = parseInt(row.count);
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalReviews: parseInt(statsResult.rows[0].total_reviews),
        averageRating: parseFloat(statsResult.rows[0].average_rating).toFixed(1),
        distribution
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Thêm đánh giá mới
 * @access  Private
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { product_id, rating, title, content } = req.body;
    const userId = req.session.userId;
    
    if (!product_id || !rating) {
      throw new AppError('ID sản phẩm và đánh giá là bắt buộc.', 400);
    }
    
    if (rating < 1 || rating > 5) {
      throw new AppError('Đánh giá phải từ 1 đến 5 sao.', 400);
    }
    
    // Kiểm tra sản phẩm tồn tại
    const productExists = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productExists.rows.length === 0) {
      throw new AppError('Sản phẩm không tồn tại.', 404);
    }
    
    // Kiểm tra người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await pool.query(
      'SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2',
      [product_id, userId]
    );
    
    if (existingReview.rows.length > 0) {
      throw new AppError('Bạn đã đánh giá sản phẩm này rồi.', 400);
    }
    
    // Kiểm tra người dùng đã mua sản phẩm này chưa
    const verifiedPurchase = await pool.query(`
      SELECT op.id
      FROM orders o
      JOIN order_products op ON o.id = op.order_id
      WHERE o.user_id = $1 AND op.product_id = $2 AND o.status = 'delivered'
      LIMIT 1
    `, [userId, product_id]);
    
    // Thêm đánh giá mới
    const result = await pool.query(`
      INSERT INTO product_reviews 
        (product_id, user_id, rating, title, content, verified_purchase)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      product_id, 
      userId, 
      rating, 
      title || null, 
      content || null,
      verifiedPurchase.rows.length > 0
    ]);
    
    // Cập nhật rating trung bình cho sản phẩm
    await updateProductAverageRating(product_id);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Cập nhật đánh giá
 * @access  Private - Chỉ người viết đánh giá hoặc admin
 */
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, content } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    // Kiểm tra đánh giá tồn tại
    const reviewResult = await pool.query(
      'SELECT * FROM product_reviews WHERE id = $1',
      [id]
    );
    
    if (reviewResult.rows.length === 0) {
      throw new AppError('Đánh giá không tồn tại.', 404);
    }
    
    const review = reviewResult.rows[0];
    
    // Kiểm tra quyền cập nhật
    if (review.user_id !== userId && userRole !== 'admin') {
      throw new AppError('Bạn không có quyền cập nhật đánh giá này.', 403);
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      throw new AppError('Đánh giá phải từ 1 đến 5 sao.', 400);
    }
    
    // Cập nhật đánh giá
    const result = await pool.query(`
      UPDATE product_reviews
      SET rating = COALESCE($1, rating),
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [rating, title, content, id]);
    
    // Cập nhật rating trung bình cho sản phẩm
    await updateProductAverageRating(review.product_id);
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Xóa đánh giá
 * @access  Private - Chỉ người viết đánh giá hoặc admin
 */
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    // Kiểm tra đánh giá tồn tại
    const reviewResult = await pool.query(
      'SELECT * FROM product_reviews WHERE id = $1',
      [id]
    );
    
    if (reviewResult.rows.length === 0) {
      throw new AppError('Đánh giá không tồn tại.', 404);
    }
    
    const review = reviewResult.rows[0];
    
    // Kiểm tra quyền xóa
    if (review.user_id !== userId && userRole !== 'admin') {
      throw new AppError('Bạn không có quyền xóa đánh giá này.', 403);
    }
    
    // Xóa các hình ảnh liên quan trước
    await pool.query('DELETE FROM review_images WHERE review_id = $1', [id]);
    
    // Xóa đánh giá
    await pool.query('DELETE FROM product_reviews WHERE id = $1', [id]);
    
    // Cập nhật rating trung bình cho sản phẩm
    await updateProductAverageRating(review.product_id);
    
    res.status(200).json({
      success: true,
      message: 'Đánh giá đã được xóa thành công.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Đánh dấu đánh giá là hữu ích
 * @access  Private
 */
router.post('/:id/helpful', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    
    // Kiểm tra đánh giá tồn tại
    const reviewExists = await pool.query(
      'SELECT id FROM product_reviews WHERE id = $1',
      [id]
    );
    
    if (reviewExists.rows.length === 0) {
      throw new AppError('Đánh giá không tồn tại.', 404);
    }
    
    // Kiểm tra người dùng đã đánh dấu hữu ích chưa
    const helpfulExists = await pool.query(
      'SELECT id FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (helpfulExists.rows.length > 0) {
      // Người dùng đã đánh dấu, xóa đánh dấu
      await pool.query(
        'DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      // Giảm số lượng helpful_count
      await pool.query(
        'UPDATE product_reviews SET helpful_count = helpful_count - 1 WHERE id = $1',
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Đã bỏ đánh dấu hữu ích.',
        marked: false
      });
    } else {
      // Người dùng chưa đánh dấu, thêm đánh dấu mới
      await pool.query(
        'INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      
      // Tăng số lượng helpful_count
      await pool.query(
        'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Đã đánh dấu là hữu ích.',
        marked: true
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/reviews/check/:productId
 * @desc    Kiểm tra người dùng đã đánh giá sản phẩm chưa
 * @access  Private
 */
router.get('/check/:productId', isAuthenticated, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.session.userId;
    
    const result = await pool.query(
      'SELECT * FROM product_reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        hasReviewed: false
      });
    }
    
    res.status(200).json({
      success: true,
      hasReviewed: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/reviews/user
 * @desc    Lấy tất cả đánh giá của người dùng hiện tại
 * @access  Private
 */
router.get('/user', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { page = 1, limit = 10 } = req.query;
    
    // Tính offset cho phân trang
    const offset = (page - 1) * limit;
    
    // Truy vấn tổng số đánh giá
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM product_reviews WHERE user_id = $1',
      [userId]
    );
    
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Truy vấn danh sách đánh giá
    const result = await pool.query(`
      SELECT 
        r.id, r.product_id, r.rating, r.title, r.content,
        r.created_at, r.updated_at, r.helpful_count, r.verified_purchase,
        p.name as product_name, p.slug as product_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as product_image
      FROM product_reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      totalItems,
      totalPages,
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/reviews/:id/report
 * @desc    Báo cáo đánh giá không phù hợp
 * @access  Private
 */
router.post('/:id/report', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.session.userId;
    
    if (!reason) {
      throw new AppError('Lý do báo cáo là bắt buộc.', 400);
    }
    
    // Kiểm tra đánh giá tồn tại
    const reviewExists = await pool.query(
      'SELECT id FROM product_reviews WHERE id = $1',
      [id]
    );
    
    if (reviewExists.rows.length === 0) {
      throw new AppError('Đánh giá không tồn tại.', 404);
    }
    
    // Kiểm tra người dùng đã báo cáo chưa
    const reportExists = await pool.query(
      'SELECT id FROM review_reports WHERE review_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (reportExists.rows.length > 0) {
      throw new AppError('Bạn đã báo cáo đánh giá này rồi.', 400);
    }
    
    // Thêm báo cáo mới
    await pool.query(
      'INSERT INTO review_reports (review_id, user_id, reason) VALUES ($1, $2, $3)',
      [id, userId, reason]
    );
    
    res.status(200).json({
      success: true,
      message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét đánh giá này.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/reviews/:id/images
 * @desc    Tải lên hình ảnh cho đánh giá
 * @access  Private - Chỉ người viết đánh giá
 */
router.post('/:id/images', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;
    const userId = req.session.userId;
    
    if (!image_url) {
      throw new AppError('URL hình ảnh là bắt buộc.', 400);
    }
    
    // Kiểm tra đánh giá tồn tại và thuộc người dùng hiện tại
    const reviewResult = await pool.query(
      'SELECT * FROM product_reviews WHERE id = $1',
      [id]
    );
    
    if (reviewResult.rows.length === 0) {
      throw new AppError('Đánh giá không tồn tại.', 404);
    }
    
    const review = reviewResult.rows[0];
    
    if (review.user_id !== userId) {
      throw new AppError('Bạn không có quyền thêm hình ảnh cho đánh giá này.', 403);
    }
    
    // Kiểm tra số lượng hình ảnh đã tải lên
    const imageCount = await pool.query(
      'SELECT COUNT(*) FROM review_images WHERE review_id = $1',
      [id]
    );
    
    if (parseInt(imageCount.rows[0].count) >= 5) {
      throw new AppError('Bạn chỉ có thể tải lên tối đa 5 hình ảnh cho một đánh giá.', 400);
    }
    
    // Thêm hình ảnh mới
    const result = await pool.query(
      'INSERT INTO review_images (review_id, image_url) VALUES ($1, $2) RETURNING *',
      [id, image_url]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/reviews/:reviewId/images/:imageId
 * @desc    Xóa hình ảnh của đánh giá
 * @access  Private - Chỉ người viết đánh giá hoặc admin
 */
router.delete('/:reviewId/images/:imageId', isAuthenticated, async (req, res, next) => {
  try {
    const { reviewId, imageId } = req.params;
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    // Kiểm tra hình ảnh tồn tại và thuộc đánh giá
    const imageResult = await pool.query(
      'SELECT ri.*, pr.user_id FROM review_images ri JOIN product_reviews pr ON ri.review_id = pr.id WHERE ri.id = $1 AND ri.review_id = $2',
      [imageId, reviewId]
    );
    
    if (imageResult.rows.length === 0) {
      throw new AppError('Hình ảnh không tồn tại hoặc không thuộc đánh giá này.', 404);
    }
    
    const image = imageResult.rows[0];
    
    // Kiểm tra quyền xóa
    if (image.user_id !== userId && userRole !== 'admin') {
      throw new AppError('Bạn không có quyền xóa hình ảnh này.', 403);
    }
    
    // Xóa hình ảnh
    await pool.query('DELETE FROM review_images WHERE id = $1', [imageId]);
    
    res.status(200).json({
      success: true,
      message: 'Hình ảnh đã được xóa thành công.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Hàm hỗ trợ cập nhật điểm đánh giá trung bình cho sản phẩm
 */
async function updateProductAverageRating(productId) {
  try {
    const ratingResult = await pool.query(`
      SELECT AVG(rating) as average_rating, COUNT(*) as review_count
      FROM product_reviews
      WHERE product_id = $1
    `, [productId]);
    
    const averageRating = ratingResult.rows[0].average_rating || 0;
    const reviewCount = ratingResult.rows[0].review_count || 0;
    
    await pool.query(`
      UPDATE products
      SET average_rating = $1, review_count = $2
      WHERE id = $3
    `, [averageRating, reviewCount, productId]);
  } catch (error) {
    console.error('Error updating product average rating:', error);
  }
}

module.exports = router;
