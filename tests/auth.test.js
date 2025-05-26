/**
 * Kiểm thử API xác thực người dùng
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Mock database
jest.mock('../database', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
      release: jest.fn()
    }))
  };
  
  return mockPool;
});

const pool = require('../database');
const app = express();

// Thiết lập middleware cơ bản
app.use(bodyParser.json());
app.use(session({
  secret: 'test_secret',
  resave: false,
  saveUninitialized: false
}));

// Import các route xác thực
require('../server')(app);

describe('API Xác thực', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Đăng ký', () => {
    test('Trả về lỗi 400 khi thiếu thông tin', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Thiếu email và password
        });
      
      expect(response.statusCode).toBe(400);
    });

    test('Trả về lỗi 409 khi username đã tồn tại', async () => {
      // Mock database query trả về một người dùng đã tồn tại
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(409);
    });

    test('Đăng ký thành công với thông tin hợp lệ', async () => {
      // Mock kiểm tra người dùng không tồn tại
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock insert thành công
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });

  describe('Đăng nhập', () => {
    test('Trả về lỗi 400 khi thiếu thông tin', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
          // Thiếu password
        });
      
      expect(response.statusCode).toBe(400);
    });

    test('Trả về lỗi 401 khi tài khoản không tồn tại', async () => {
      // Mock không tìm thấy người dùng
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(401);
    });

    test('Trả về lỗi 401 khi mật khẩu không đúng', async () => {
      // Mock tìm thấy người dùng
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: await bcrypt.hash('CorrectPassword123!', 10),
          is_active: true,
          role: 'user'
        }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'WrongPassword123!'
        });
      
      expect(response.statusCode).toBe(401);
    });

    test('Đăng nhập thành công với thông tin đúng', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      
      // Mock tìm thấy người dùng
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: passwordHash,
          is_active: true,
          role: 'user',
          full_name: 'Test User'
        }]
      });

      // Mock cập nhật thời gian đăng nhập
      pool.query.mockResolvedValueOnce({
        rowCount: 1
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });

  describe('Đăng xuất', () => {
    test('Trả về lỗi 400 khi chưa đăng nhập', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.statusCode).toBe(400);
    });

    test('Đăng xuất thành công', async () => {
      // Tạo agent để duy trì phiên
      const agent = request.agent(app);
      
      // Mock đăng nhập thành công
      const passwordHash = await bcrypt.hash('Password123!', 10);
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: passwordHash,
          is_active: true,
          role: 'user'
        }]
      });
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      // Đăng nhập
      await agent
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        });

      // Đăng xuất
      const logoutResponse = await agent
        .post('/api/auth/logout');
      
      expect(logoutResponse.statusCode).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
    });
  });
});