/**
 * Routes quản lý người dùng
 * Xử lý các thao tác liên quan đến hồ sơ người dùng, địa chỉ và tài khoản
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route GET /api/users/profile
 * @desc Lấy thông tin hồ sơ người dùng đã đăng nhập
 * @access Private
 */
router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, avatar_url, created_at, last_login FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng.'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Cập nhật thông tin hồ sơ người dùng
 * @access Private
 */
router.put('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { full_name, phone, avatar_url } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET full_name = $1, phone = $2, avatar_url = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, full_name, phone, avatar_url',
      [full_name, phone, avatar_url, userId]
    );
    
    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/users/addresses
 * @desc Lấy danh sách địa chỉ của người dùng
 * @access Private
 */
router.get('/addresses', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    
    const result = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/users/addresses
 * @desc Thêm địa chỉ mới cho người dùng
 * @access Private
 */
router.post('/addresses', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { address_line1, address_line2, city, state, postal_code, country, phone, is_default } = req.body;
    
    // Nếu đánh dấu là địa chỉ mặc định, hủy đánh dấu các địa chỉ khác
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }
    
    const result = await pool.query(
      'INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country, phone, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, address_line1, address_line2, city, state, postal_code, country, phone, is_default]
    );
    
    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ mới thành công.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /api/users/addresses/:id
 * @desc Cập nhật địa chỉ người dùng
 * @access Private
 */
router.put('/addresses/:id', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const addressId = req.params.id;
    const { address_line1, address_line2, city, state, postal_code, country, phone, is_default } = req.body;
    
    // Kiểm tra quyền sở hữu địa chỉ
    const checkResult = await pool.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật địa chỉ này.'
      });
    }
    
    // Nếu đánh dấu là địa chỉ mặc định, hủy đánh dấu các địa chỉ khác
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }
    
    const result = await pool.query(
      'UPDATE user_addresses SET address_line1 = $1, address_line2 = $2, city = $3, state = $4, postal_code = $5, country = $6, phone = $7, is_default = $8, updated_at = NOW() WHERE id = $9 AND user_id = $10 RETURNING *',
      [address_line1, address_line2, city, state, postal_code, country, phone, is_default, addressId, userId]
    );
    
    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/users/addresses/:id
 * @desc Xóa địa chỉ người dùng
 * @access Private
 */
router.delete('/addresses/:id', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const addressId = req.params.id;
    
    // Kiểm tra quyền sở hữu địa chỉ
    const checkResult = await pool.query(
      'SELECT id, is_default FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa địa chỉ này.'
      });
    }
    
    // Không cho phép xóa địa chỉ mặc định
    if (checkResult.rows[0].is_default) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.'
      });
    }
    
    await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );
    
    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
