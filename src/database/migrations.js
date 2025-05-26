/**
 * File migrations.js
 * Cải thiện cấu trúc cơ sở dữ liệu và tối ưu các bảng
 */

const pool = require('../../database');
const logger = require('../utils/logger');

/**
 * Thêm index, ràng buộc và các trường mới vào cơ sở dữ liệu
 */
async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Bắt đầu transaction
    await client.query('BEGIN');
    
    logger.info('Bắt đầu chạy migrations...');

    // 1. Tối ưu bảng users
    logger.info('Tối ưu bảng users...');
    await client.query(`
      -- Thêm các trường mới cho users
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

      -- Tạo index để tối ưu truy vấn
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      
      -- Tạo trigger cập nhật thời gian updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // 2. Tối ưu bảng products
    logger.info('Tối ưu bảng products...');
    await client.query(`
      -- Thêm các trường mới cho products
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
      
      -- Tạo index để tối ưu truy vấn
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      
      -- Tạo check constraint
      ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_price_positive;
      ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);
      
      ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_saleprice_positive;
      ALTER TABLE products ADD CONSTRAINT chk_saleprice_positive CHECK (salePrice >= 0);
      
      ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_stock_positive;
      ALTER TABLE products ADD CONSTRAINT chk_stock_positive CHECK (stock >= 0);
      
      -- Cập nhật trigger updated_at
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // 3. Tạo bảng orders
    logger.info('Tạo bảng orders và order_items...');
    await client.query(`
      -- Tạo bảng orders
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        total_amount DECIMAL(12,2) NOT NULL,
        shipping_address TEXT,
        shipping_method VARCHAR(50),
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      -- Tạo index cho orders
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      
      -- Tạo bảng order_items
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tạo index cho order_items
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
      
      -- Tạo trigger updated_at cho orders
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // 4. Tạo bảng reviews
    logger.info('Tạo bảng reviews...');
    await client.query(`
      -- Tạo bảng reviews
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(100),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      -- Tạo index cho reviews
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      
      -- Tạo trigger updated_at cho reviews
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
      
      -- Tạo function để cập nhật rating trung bình của sản phẩm
      CREATE OR REPLACE FUNCTION update_product_rating()
      RETURNS TRIGGER AS $$
      DECLARE
        avg_rating DECIMAL(2,1);
      BEGIN
        -- Tính rating trung bình
        SELECT COALESCE(AVG(rating), 0) INTO avg_rating
        FROM reviews
        WHERE product_id = NEW.product_id;
        
        -- Cập nhật rating cho sản phẩm
        UPDATE products
        SET rating = avg_rating,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Tạo trigger để cập nhật rating khi có review mới
      DROP TRIGGER IF EXISTS trigger_update_product_rating ON reviews;
      CREATE TRIGGER trigger_update_product_rating
      AFTER INSERT OR UPDATE OR DELETE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_product_rating();
    `);

    // 5. Tạo bảng carts và cart_items
    logger.info('Tạo bảng carts và cart_items...');
    await client.query(`
      -- Tạo bảng carts
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      -- Tạo index cho carts
      CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
      CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
      
      -- Tạo bảng cart_items
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      -- Tạo index cho cart_items
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
      
      -- Tạo trigger updated_at cho carts
      DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
      CREATE TRIGGER update_carts_updated_at
      BEFORE UPDATE ON carts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
      
      -- Tạo trigger updated_at cho cart_items
      DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
      CREATE TRIGGER update_cart_items_updated_at
      BEFORE UPDATE ON cart_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Commit transaction
    await client.query('COMMIT');
    logger.info('Migrations hoàn thành thành công!');
    
  } catch (err) {
    // Rollback nếu có lỗi
    await client.query('ROLLBACK');
    logger.error('Lỗi khi chạy migrations:', err);
    throw err;
  } finally {
    // Giải phóng client
    client.release();
  }
}

module.exports = { runMigrations };

// Chạy migrations nếu được gọi trực tiếp
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations hoàn thành.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Lỗi migrations:', err);
      process.exit(1);
    });
}