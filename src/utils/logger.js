/**
 * Utility ghi log cho ứng dụng
 * Hỗ trợ các level log khác nhau và định dạng thông tin log
 */

// Các level log
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Màu sắc cho các level log (khi hiển thị trong console)
const COLORS = {
  ERROR: '\x1b[31m', // Đỏ
  WARN: '\x1b[33m',  // Vàng
  INFO: '\x1b[36m',  // Xanh lam
  DEBUG: '\x1b[90m', // Xám
  RESET: '\x1b[0m'   // Reset màu
};

// Định dạng thời gian
const formatTime = () => {
  const now = new Date();
  return now.toISOString();
};

// Ghi log với level cụ thể
const log = (level, message, data = null) => {
  // Kiểm tra môi trường để quyết định có ghi log hay không
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (level === LOG_LEVELS.DEBUG && !isDevelopment) {
    return; // Không ghi log debug trong môi trường production
  }

  const timestamp = formatTime();
  const color = COLORS[level] || COLORS.RESET;
  
  let logMessage = `${timestamp} [${level}] ${message}`;
  
  // Log ra console
  console.log(`${color}${logMessage}${COLORS.RESET}`);
  
  // Log data nếu có
  if (data) {
    if (data instanceof Error) {
      console.log(`${color}${timestamp} [${level}] Stack: ${data.stack}${COLORS.RESET}`);
    } else {
      console.log(`${color}${timestamp} [${level}] Data:`, data, COLORS.RESET);
    }
  }
  
  // TODO: Thêm logic ghi log vào file hoặc service log nếu cần
};

// Các hàm log theo level
module.exports = {
  error: (message, data = null) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data = null) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data = null) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data = null) => log(LOG_LEVELS.DEBUG, message, data),
  LOG_LEVELS
};