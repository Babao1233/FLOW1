/**
 * Cấu hình kết nối cơ sở dữ liệu PostgreSQL
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Tạo pool kết nối từ các biến môi trường
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'TEST',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  max: 20, // Số kết nối tối đa trong pool
  idleTimeoutMillis: 30000, // Thời gian chờ trước khi đóng kết nối không hoạt động
  connectionTimeoutMillis: 2000, // Thời gian chờ kết nối mới
});

// Xử lý sự kiện lỗi ở cấp pool
pool.on('error', (err, client) => {
  logger.error('Lỗi không mong muốn từ client PostgreSQL', err);
  process.exit(-1);
});

// Kiểm tra kết nối khi khởi động
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Kết nối thành công đến PostgreSQL');
    client.release();
    return true;
  } catch (err) {
    logger.error('Không thể kết nối đến PostgreSQL', err);
    return false;
  }
};

module.exports = {
  pool,
  checkConnection
};
