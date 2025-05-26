/**
 * Kiểm thử API sản phẩm
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

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

// Import các route sản phẩm
require('../server')(app);

describe('API Sản phẩm', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Lấy danh sách sản phẩm', () => {
    test('Trả về danh sách sản phẩm thành công', async () => {
      // Mock database trả về danh sách sản phẩm
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 1, 
            name: 'Smart TV', 
            price: 12000000, 
            description: 'TV thông minh 55 inch', 
            category: 'TV', 
            stock: 10,
            image_url: 'tv.jpg'
          },
          { 
            id: 2, 
            name: 'Máy lạnh', 
            price: 8000000, 
            description: 'Máy lạnh tiết kiệm điện', 
            category: 'Máy lạnh', 
            stock: 15,
            image_url: 'aircond.jpg'
          }
        ],
        rowCount: 2
      });

      // Mock tổng số sản phẩm cho phân trang
      pool.query.mockResolvedValueOnce({
        rows: [{ count: '10' }]
      });

      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    test('Lọc sản phẩm theo danh mục', async () => {
      // Mock database trả về danh sách sản phẩm đã lọc
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 1, 
            name: 'Smart TV', 
            price: 12000000, 
            description: 'TV thông minh 55 inch', 
            category: 'TV', 
            stock: 10,
            image_url: 'tv.jpg'
          }
        ],
        rowCount: 1
      });

      // Mock tổng số sản phẩm cho phân trang
      pool.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/products')
        .query({ category: 'TV' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].category).toBe('TV');
    });

    test('Tìm kiếm sản phẩm theo từ khóa', async () => {
      // Mock database trả về danh sách sản phẩm tìm kiếm
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 2, 
            name: 'Máy lạnh', 
            price: 8000000, 
            description: 'Máy lạnh tiết kiệm điện', 
            category: 'Máy lạnh', 
            stock: 15,
            image_url: 'aircond.jpg'
          }
        ],
        rowCount: 1
      });

      // Mock tổng số sản phẩm cho phân trang
      pool.query.mockResolvedValueOnce({
        rows: [{ count: '1' }]
      });

      const response = await request(app)
        .get('/api/products')
        .query({ search: 'tiết kiệm' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Máy lạnh');
    });
  });

  describe('Lấy thông tin chi tiết sản phẩm', () => {
    test('Trả về thông tin sản phẩm khi tìm thấy ID', async () => {
      // Mock database trả về chi tiết sản phẩm
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 1, 
            name: 'Smart TV', 
            price: 12000000, 
            description: 'TV thông minh 55 inch', 
            category: 'TV', 
            stock: 10,
            image_url: 'tv.jpg',
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      });

      const response = await request(app)
        .get('/api/products/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Smart TV');
    });

    test('Trả về lỗi 404 khi không tìm thấy sản phẩm', async () => {
      // Mock database không tìm thấy sản phẩm
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/products/999');
      
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Lấy danh mục sản phẩm', () => {
    test('Trả về danh sách danh mục thành công', async () => {
      // Mock database trả về danh sách danh mục
      pool.query.mockResolvedValueOnce({
        rows: [
          { category: 'TV' },
          { category: 'Máy lạnh' },
          { category: 'Tủ lạnh' },
          { category: 'Máy giặt' }
        ]
      });

      const response = await request(app)
        .get('/api/categories');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(4);
      expect(response.body).toContain('TV');
    });
  });

  describe('Lấy sản phẩm nổi bật', () => {
    test('Trả về danh sách sản phẩm nổi bật thành công', async () => {
      // Mock database trả về danh sách sản phẩm nổi bật
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 1, 
            name: 'Smart TV', 
            price: 12000000, 
            description: 'TV thông minh 55 inch', 
            category: 'TV', 
            stock: 10,
            image_url: 'tv.jpg',
            is_featured: true
          },
          { 
            id: 3, 
            name: 'Tủ lạnh thông minh', 
            price: 15000000, 
            description: 'Tủ lạnh thông minh kết nối WiFi', 
            category: 'Tủ lạnh', 
            stock: 5,
            image_url: 'fridge.jpg',
            is_featured: true
          }
        ]
      });

      const response = await request(app)
        .get('/api/products/featured');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].is_featured).toBe(true);
    });
  });
});