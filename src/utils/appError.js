/**
 * Module xử lý lỗi ứng dụng
 * Re-export AppError từ errorHandler để duy trì tính tương thích
 */

const { AppError } = require('../middleware/errorHandler');

module.exports = AppError;
