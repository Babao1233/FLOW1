/**
 * Kiểm thử middleware bảo mật
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Import các middleware bảo mật
const { 
  securityHeaders, 
  bruteForceProtection, 
  sqlInjectionProtection,
  requestSizeLimiter,
  rateLimiter
} = require('../src/middleware/security');

// Tạo ứng dụng Express giả lập
const app = express();
app.use(bodyParser.json());

// Áp dụng middleware bảo mật
app.use(securityHeaders);
app.use(sqlInjectionProtection);
app.use(requestSizeLimiter);

// Mock endpoint để kiểm thử
app.get('/test/security-headers', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.post('/test/sql-injection', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.post('/test/request-size', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

// Áp dụng brute force protection cho route đăng nhập
app.use(bruteForceProtection);
app.post('/api/auth/login', (req, res) => {
  // Giả lập đăng nhập thất bại
  res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
});

// Áp dụng rate limiter
app.use('/api/products', rateLimiter);
app.get('/api/products', (req, res) => {
  res.status(200).json({ products: [] });
});

describe('Middleware bảo mật', () => {
  describe('Security Headers', () => {
    test('Thêm các header bảo mật vào response', async () => {
      const response = await request(app).get('/test/security-headers');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['referrer-policy']).toBeDefined();
    });
  });

  describe('SQL Injection Protection', () => {
    test('Chặn SQL Injection trong query parameters', async () => {
      const response = await request(app)
        .get('/test/sql-injection')
        .query({ q: "'; DROP TABLE users; --" });
      
      expect(response.statusCode).toBe(403);
    });

    test('Chặn SQL Injection trong body', async () => {
      const response = await request(app)
        .post('/test/sql-injection')
        .send({ query: "UNION SELECT * FROM users" });
      
      expect(response.statusCode).toBe(403);
    });

    test('Cho phép query hợp lệ', async () => {
      const response = await request(app)
        .post('/test/sql-injection')
        .send({ query: "normal search term" });
      
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Request Size Limiter', () => {
    test('Giới hạn kích thước request', async () => {
      // Tạo một payload lớn
      const largePayload = { data: 'a'.repeat(2 * 1024 * 1024) }; // 2MB
      
      const response = await request(app)
        .post('/test/request-size')
        .send(largePayload);
      
      expect(response.statusCode).toBe(413);
    });

    test('Cho phép request có kích thước hợp lệ', async () => {
      const payload = { data: 'test payload' };
      
      const response = await request(app)
        .post('/test/request-size')
        .send(payload);
      
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Brute Force Protection', () => {
    test('Giới hạn số lần đăng nhập thất bại', async () => {
      // Giả lập nhiều lần đăng nhập thất bại
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrongpassword' });
      }
      
      // Lần thử thứ 6 sẽ bị chặn
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });
      
      expect(response.statusCode).toBe(429);
    });
  });

  describe('Rate Limiter', () => {
    test('Giới hạn số lượng request trong một khoảng thời gian', async () => {
      // Giả lập nhiều request trong thời gian ngắn
      const agent = request.agent(app);
      const requests = [];
      
      for (let i = 0; i < 101; i++) {
        requests.push(agent.get('/api/products'));
      }
      
      const responses = await Promise.all(requests);
      
      // Ít nhất một request sẽ bị giới hạn (status 429)
      const limitedResponses = responses.filter(r => r.statusCode === 429);
      expect(limitedResponses.length).toBeGreaterThan(0);
    });
  });
});