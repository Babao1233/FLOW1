const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Mock pg Pool
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn().mockReturnThis(),
    release: jest.fn(),
    on: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

const app = express();
app.use(bodyParser.json());

// Import route trực tiếp
const reviewRoutes = require('../../src/routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

describe('API đánh giá sản phẩm', () => {
  let pool;
  
  beforeEach(() => {
    pool = new Pool();
    // Reset mock calls
    pool.query.mockReset();
  });

  test('GET /api/reviews/product/:id - Lấy danh sách đánh giá của sản phẩm', async () => {
    // Mock dữ liệu trả về
    const mockReviews = [
      { id: 1, product_id: 1, user_id: 1, rating: 5, comment: 'Sản phẩm tốt', created_at: new Date() }
    ];
    
    pool.query.mockResolvedValueOnce({ rows: mockReviews, rowCount: 1 });
    
    const response = await request(app)
      .get('/api/reviews/product/1');
      
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
