/**
 * Kiểm thử các tiện ích
 */

const passwordUtils = require('../src/utils/passwordUtils');
const tokenUtils = require('../src/utils/tokenUtils');

describe('Tiện ích mật khẩu', () => {
  describe('Mã hóa và so sánh mật khẩu', () => {
    test('Mã hóa mật khẩu thành công', async () => {
      const password = 'StrongPassword123!';
      const hashedPassword = await passwordUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
      expect(hashedPassword.length).toBeGreaterThan(10);
    });

    test('So sánh mật khẩu đúng', async () => {
      const password = 'StrongPassword123!';
      const hashedPassword = await passwordUtils.hashPassword(password);
      
      const result = await passwordUtils.comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    test('So sánh mật khẩu sai', async () => {
      const password = 'StrongPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await passwordUtils.hashPassword(password);
      
      const result = await passwordUtils.comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('Kiểm tra độ mạnh mật khẩu', () => {
    test('Mật khẩu mạnh', () => {
      const password = 'StrongPassword123!';
      const result = passwordUtils.checkPasswordStrength(password);
      
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    test('Mật khẩu trung bình', () => {
      const password = 'Medium123';
      const result = passwordUtils.checkPasswordStrength(password);
      
      expect(result.strength).toBe('medium');
    });

    test('Mật khẩu yếu', () => {
      const password = 'weak';
      const result = passwordUtils.checkPasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    test('Phát hiện mật khẩu phổ biến', () => {
      const password = 'password123';
      const result = passwordUtils.checkPasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
    });
  });

  describe('Tạo mật khẩu ngẫu nhiên', () => {
    test('Tạo mật khẩu ngẫu nhiên mạnh', () => {
      const password = passwordUtils.generateRandomPassword();
      const result = passwordUtils.checkPasswordStrength(password);
      
      expect(password.length).toBeGreaterThanOrEqual(12);
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });
  });
});

describe('Tiện ích token', () => {
  describe('Tạo và xác thực JWT', () => {
    test('Tạo JWT token thành công', () => {
      const payload = { userId: 1, username: 'testuser' };
      const token = tokenUtils.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('Xác thực JWT token thành công', () => {
      const payload = { userId: 1, username: 'testuser' };
      const token = tokenUtils.generateToken(payload);
      
      const decoded = tokenUtils.verifyToken(token);
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
    });

    test('Xác thực JWT token thất bại với token không hợp lệ', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        tokenUtils.verifyToken(invalidToken);
      }).toThrow();
    });
  });

  describe('Tạo refresh token', () => {
    test('Tạo refresh token thành công', () => {
      const userId = 1;
      const result = tokenUtils.generateRefreshToken(userId);
      
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(40);
      expect(result.expiresAt instanceof Date).toBe(true);
    });
  });

  describe('Tạo token xác thực', () => {
    test('Tạo bộ token xác thực đầy đủ', async () => {
      const user = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com',
        role: 'user'
      };
      
      const tokens = await tokenUtils.generateAuthTokens(user);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.refreshTokenExpires).toBeDefined();
      expect(tokens.tokenType).toBe('Bearer');
    });
  });

  describe('Tạo API key', () => {
    test('Tạo API key thành công', () => {
      const name = 'Test API';
      const userId = 1;
      
      const apiKey = tokenUtils.generateApiKey(name, userId);
      
      expect(apiKey).toBeDefined();
      expect(typeof apiKey).toBe('string');
      expect(apiKey.startsWith('yapee_')).toBe(true);
      expect(apiKey.length).toBeGreaterThan(20);
    });
  });

  describe('Tạo CSRF token', () => {
    test('Tạo CSRF token thành công', () => {
      const token = tokenUtils.generateCsrfToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    test('Mỗi CSRF token là duy nhất', () => {
      const token1 = tokenUtils.generateCsrfToken();
      const token2 = tokenUtils.generateCsrfToken();
      
      expect(token1).not.toEqual(token2);
    });
  });
});