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
const categoryRoutes = require('../../src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

describe('API danh mục sản phẩm', () => {
  let pool;
  
  beforeEach(() => {
    pool = new Pool();
    // Reset mock calls
    pool.query.mockReset();
  });

  test('GET /api/categories - Lấy danh sách danh mục', async () => {
    // Mock dữ liệu trả về
    const mockCategories = [
      { id: 1, name: 'Quần áo', slug: 'quan-ao', description: 'Danh mục quần áo', parent_id: null, created_at: new Date() },
      { id: 2, name: 'Điện tử', slug: 'dien-tu', description: 'Danh mục điện tử', parent_id: null, created_at: new Date() }
    ];
    
    pool.query.mockResolvedValueOnce({ rows: mockCategories, rowCount: 2 });
    
    const response = await request(app)
      .get('/api/categories');
      
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });
});
