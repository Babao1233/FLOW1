/**
 * Routes cho quản lý danh mục sản phẩm
 * Định nghĩa các endpoints API liên quan đến danh mục
 */

const express = require('express');
const router = express.Router();
const pool = require('../../database');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/index');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/categories
 * @desc    Lấy danh sách tất cả danh mục
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, parent_id, 
       created_at, updated_at, image_url, is_active, 
       (SELECT COUNT(*) FROM products WHERE category_id = product_categories.id) AS product_count
       FROM product_categories
       WHERE is_active = true
       ORDER BY name ASC`
    );
    
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
 * @route   GET /api/categories/:id
 * @desc    Lấy chi tiết một danh mục theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, slug, description, parent_id, 
       created_at, updated_at, image_url, is_active,
       (SELECT COUNT(*) FROM products WHERE category_id = product_categories.id) AS product_count
       FROM product_categories
       WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('Danh mục không tồn tại.', 404);
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
 * @route   GET /api/categories/slug/:slug
 * @desc    Lấy chi tiết một danh mục theo slug
 * @access  Public
 */
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT id, name, slug, description, parent_id, 
       created_at, updated_at, image_url, is_active,
       (SELECT COUNT(*) FROM products WHERE category_id = product_categories.id) AS product_count
       FROM product_categories
       WHERE slug = $1 AND is_active = true`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('Danh mục không tồn tại.', 404);
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
 * @route   GET /api/categories/:id/products
 * @desc    Lấy danh sách sản phẩm thuộc một danh mục
 * @access  Public
 */
router.get('/:id/products', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    // Tính offset cho phân trang
    const offset = (page - 1) * limit;
    
    // Xác định sắp xếp
    let orderBy;
    switch (sort) {
      case 'price_asc':
        orderBy = 'price ASC';
        break;
      case 'price_desc':
        orderBy = 'price DESC';
        break;
      case 'name_asc':
        orderBy = 'name ASC';
        break;
      case 'name_desc':
        orderBy = 'name DESC';
        break;
      case 'newest':
      default:
        orderBy = 'created_at DESC';
    }
    
    // Truy vấn tổng số sản phẩm
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = true',
      [id]
    );
    
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Truy vấn danh sách sản phẩm
    const result = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.sale_price, p.stock_quantity,
       p.created_at, p.updated_at, p.is_active, p.is_featured,
       (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS thumbnail
       FROM products p
       WHERE p.category_id = $1 AND p.is_active = true
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );
    
    // Kiểm tra xem danh mục có tồn tại không
    if (totalItems === 0) {
      const categoryExists = await pool.query(
        'SELECT id FROM product_categories WHERE id = $1',
        [id]
      );
      
      if (categoryExists.rows.length === 0) {
        throw new AppError('Danh mục không tồn tại.', 404);
      }
    }
    
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
 * @route   POST /api/categories
 * @desc    Tạo danh mục mới
 * @access  Private - Admin only
 */
router.post('/', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { name, slug, description, parent_id, image_url, is_active } = req.body;
    
    if (!name || !slug) {
      throw new AppError('Tên và slug là bắt buộc.', 400);
    }
    
    // Kiểm tra xem slug đã tồn tại chưa
    const existingSlug = await pool.query(
      'SELECT id FROM product_categories WHERE slug = $1',
      [slug]
    );
    
    if (existingSlug.rows.length > 0) {
      throw new AppError('Slug đã tồn tại, vui lòng chọn slug khác.', 400);
    }
    
    // Kiểm tra parent_id nếu có
    if (parent_id) {
      const parentExists = await pool.query(
        'SELECT id FROM product_categories WHERE id = $1',
        [parent_id]
      );
      
      if (parentExists.rows.length === 0) {
        throw new AppError('Danh mục cha không tồn tại.', 400);
      }
    }
    
    // Thêm danh mục mới
    const result = await pool.query(
      `INSERT INTO product_categories (name, slug, description, parent_id, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, slug, description, parent_id, image_url, is_active || true]
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
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật danh mục
 * @access  Private - Admin only
 */
router.put('/:id', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent_id, image_url, is_active } = req.body;
    
    // Kiểm tra xem danh mục có tồn tại không
    const categoryExists = await pool.query(
      'SELECT id FROM product_categories WHERE id = $1',
      [id]
    );
    
    if (categoryExists.rows.length === 0) {
      throw new AppError('Danh mục không tồn tại.', 404);
    }
    
    // Kiểm tra xem slug đã tồn tại chưa (nếu có thay đổi)
    if (slug) {
      const existingSlug = await pool.query(
        'SELECT id FROM product_categories WHERE slug = $1 AND id != $2',
        [slug, id]
      );
      
      if (existingSlug.rows.length > 0) {
        throw new AppError('Slug đã tồn tại, vui lòng chọn slug khác.', 400);
      }
    }
    
    // Kiểm tra parent_id nếu có
    if (parent_id) {
      // Không cho phép đặt parent_id là chính nó
      if (parent_id === parseInt(id)) {
        throw new AppError('Danh mục không thể là danh mục cha của chính nó.', 400);
      }
      
      const parentExists = await pool.query(
        'SELECT id FROM product_categories WHERE id = $1',
        [parent_id]
      );
      
      if (parentExists.rows.length === 0) {
        throw new AppError('Danh mục cha không tồn tại.', 400);
      }
    }
    
    // Cập nhật danh mục
    const result = await pool.query(
      `UPDATE product_categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           parent_id = $4,
           image_url = COALESCE($5, image_url),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, slug, description, parent_id, image_url, is_active, id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa danh mục
 * @access  Private - Admin only
 */
router.delete('/:id', isAuthenticated, hasRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem danh mục có tồn tại không
    const categoryExists = await pool.query(
      'SELECT id FROM product_categories WHERE id = $1',
      [id]
    );
    
    if (categoryExists.rows.length === 0) {
      throw new AppError('Danh mục không tồn tại.', 404);
    }
    
    // Kiểm tra xem danh mục có sản phẩm không
    const productsCount = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(productsCount.rows[0].count) > 0) {
      throw new AppError('Không thể xóa danh mục đang có sản phẩm.', 400);
    }
    
    // Kiểm tra xem danh mục có danh mục con không
    const childCategories = await pool.query(
      'SELECT COUNT(*) FROM product_categories WHERE parent_id = $1',
      [id]
    );
    
    if (parseInt(childCategories.rows[0].count) > 0) {
      throw new AppError('Không thể xóa danh mục đang có danh mục con.', 400);
    }
    
    // Xóa danh mục
    await pool.query(
      'DELETE FROM product_categories WHERE id = $1',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Danh mục đã được xóa thành công.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
