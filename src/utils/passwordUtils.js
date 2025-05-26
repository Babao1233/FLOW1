/**
 * Tiện ích xử lý mật khẩu an toàn
 * Mã hóa, kiểm tra và đánh giá độ mạnh của mật khẩu
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Các hằng số cấu hình
 */
const SALT_ROUNDS = 12; // Số vòng băm để tăng tính bảo mật
const MIN_PASSWORD_LENGTH = 8; // Độ dài tối thiểu của mật khẩu
const PASSWORD_TIMEOUT_DAYS = 90; // Thời gian hết hạn mật khẩu (ngày)

/**
 * Mã hóa mật khẩu sử dụng bcrypt
 * @param {string} password - Mật khẩu dạng text
 * @returns {Promise<string>} - Mật khẩu đã mã hóa
 */
exports.hashPassword = async (password) => {
  try {
    // Tạo salt ngẫu nhiên
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // Mã hóa mật khẩu với salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    logger.error('Lỗi khi mã hóa mật khẩu', err);
    throw new Error('Không thể mã hóa mật khẩu. Vui lòng thử lại.');
  }
};

/**
 * So sánh mật khẩu với mật khẩu đã mã hóa
 * @param {string} password - Mật khẩu dạng text cần kiểm tra
 * @param {string} hashedPassword - Mật khẩu đã mã hóa để so sánh
 * @returns {Promise<boolean>} - true nếu khớp, false nếu không khớp
 */
exports.comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    logger.error('Lỗi khi so sánh mật khẩu', err);
    throw new Error('Không thể xác minh mật khẩu. Vui lòng thử lại.');
  }
};

/**
 * Kiểm tra độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {Object} - Kết quả kiểm tra và điểm đánh giá
 */
exports.checkPasswordStrength = (password) => {
  // Các tiêu chí đánh giá
  const criteria = {
    length: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  // Tính điểm
  let score = 0;
  if (criteria.length) score++;
  if (criteria.uppercase) score++;
  if (criteria.lowercase) score++;
  if (criteria.number) score++;
  if (criteria.special) score++;
  
  // Đánh giá mức độ mạnh
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  // Kiểm tra mật khẩu phổ biến (ví dụ: 'password123', '123456789', v.v.)
  const commonPasswords = [
    'password', 'admin', '123456', 'qwerty', 'welcome', 
    'password123', '12345678', '111111', 'abc123'
  ];
  
  const isCommon = commonPasswords.some(common => 
    password.toLowerCase().includes(common)
  );
  
  if (isCommon) {
    strength = 'weak';
    score = Math.max(1, score - 2); // Giảm điểm nếu là mật khẩu phổ biến
  }
  
  return {
    score,
    strength,
    isValid: strength !== 'weak',
    criteria,
    feedback: getFeedback(criteria, isCommon)
  };
};

/**
 * Tạo phản hồi cho người dùng dựa trên kết quả kiểm tra mật khẩu
 * @param {Object} criteria - Các tiêu chí đã kiểm tra
 * @param {boolean} isCommon - Mật khẩu có phổ biến không
 * @returns {Array<string>} - Danh sách các đề xuất cải thiện
 */
function getFeedback(criteria, isCommon) {
  const feedback = [];
  
  if (!criteria.length) {
    feedback.push(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
  }
  
  if (!criteria.uppercase) {
    feedback.push('Mật khẩu nên có ít nhất một chữ cái viết hoa (A-Z).');
  }
  
  if (!criteria.lowercase) {
    feedback.push('Mật khẩu nên có ít nhất một chữ cái viết thường (a-z).');
  }
  
  if (!criteria.number) {
    feedback.push('Mật khẩu nên có ít nhất một chữ số (0-9).');
  }
  
  if (!criteria.special) {
    feedback.push('Mật khẩu nên có ít nhất một ký tự đặc biệt (!@#$%^&*...).');
  }
  
  if (isCommon) {
    feedback.push('Mật khẩu này quá phổ biến và dễ đoán. Vui lòng chọn mật khẩu khác.');
  }
  
  return feedback;
}

/**
 * Tạo token reset mật khẩu ngẫu nhiên
 * @returns {Object} - Token và thời gian hết hạn
 */
exports.generateResetToken = () => {
  // Tạo token ngẫu nhiên
  const token = crypto.randomBytes(32).toString('hex');
  
  // Thời gian hết hạn (2 giờ)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);
  
  return {
    token,
    expiresAt
  };
};

/**
 * Tạo mật khẩu ngẫu nhiên mạnh
 * @param {number} length - Độ dài mật khẩu (mặc định: 12)
 * @returns {string} - Mật khẩu ngẫu nhiên
 */
exports.generateRandomPassword = (length = 12) => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Đảm bảo có ít nhất một ký tự từ mỗi loại
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Thêm các ký tự ngẫu nhiên cho đến khi đủ độ dài
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Xáo trộn mật khẩu
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Tính toán thời gian hết hạn mật khẩu
 * @param {Date} lastPasswordChange - Thời điểm thay đổi mật khẩu gần nhất
 * @returns {Object} - Thông tin về trạng thái hết hạn mật khẩu
 */
exports.checkPasswordExpiration = (lastPasswordChange) => {
  if (!lastPasswordChange) {
    return {
      expired: false,
      daysRemaining: PASSWORD_TIMEOUT_DAYS,
      requiresChange: false
    };
  }
  
  const now = new Date();
  const lastChange = new Date(lastPasswordChange);
  const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
  
  return {
    expired: diffDays >= PASSWORD_TIMEOUT_DAYS,
    daysRemaining: Math.max(0, PASSWORD_TIMEOUT_DAYS - diffDays),
    requiresChange: diffDays >= PASSWORD_TIMEOUT_DAYS || diffDays > PASSWORD_TIMEOUT_DAYS - 7
  };
};