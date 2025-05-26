/**
 * Tệp cấu hình môi trường kiểm thử
 * Chạy trước khi các bài kiểm thử được thực hiện
 */

// Sử dụng biến môi trường cho kiểm thử
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'yapee_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.SESSION_SECRET = 'test_secret_key';
process.env.PORT = 3001;

// Tắt log để không làm nhiễu kết quả kiểm thử
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Thiết lập thời gian chờ lớn hơn cho các thao tác bất đồng bộ
jest.setTimeout(10000);

// Xử lý sau khi tất cả các bài kiểm thử hoàn thành
afterAll(async () => {
  // Đóng tất cả các kết nối đang mở
  if (global.server) {
    await new Promise((resolve) => global.server.close(resolve));
  }

  // Dọn dẹp nếu cần thiết
});