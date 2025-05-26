const pool = require('./database');

/**
 * Script cập nhật cơ sở dữ liệu để hỗ trợ tính năng quản lý tài khoản người dùng
 * Bổ sung các bảng: 
 * - Nâng cấp bảng users
 * - user_addresses (địa chỉ người dùng)
 * - shipping_addresses (địa chỉ giao hàng đơn hàng)
 * - orders (đơn hàng)
 * - order_products (sản phẩm trong đơn hàng)
 */
async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    // Bắt đầu transaction
    await client.query('BEGIN');
    
    console.log('Bắt đầu cập nhật cơ sở dữ liệu...');
    
    // Nâng cấp bảng users
    console.log('Nâng cấp bảng users...');
    await client.query(`
      DO $$
      BEGIN
        -- Thêm cột full_name nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
        ) THEN
          ALTER TABLE users ADD COLUMN full_name VARCHAR(100);
        END IF;
        
        -- Thêm cột phone nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
        ) THEN
          ALTER TABLE users ADD COLUMN phone VARCHAR(15);
        END IF;
        
        -- Thêm cột avatar_url nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
        ) THEN
          ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
        END IF;
        
        -- Thêm cột role nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
        
        -- Thêm cột is_active nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active'
        ) THEN
          ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        
        -- Thêm cột last_login nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login'
        ) THEN
          ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
        END IF;
        
        -- Thêm cột password_changed_at nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_changed_at'
        ) THEN
          ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;
        END IF;
        
        -- Thêm cột user_settings nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_settings'
        ) THEN
          ALTER TABLE users ADD COLUMN user_settings JSONB DEFAULT '{}';
        END IF;
        
        -- Thêm cột updated_at nếu chưa tồn tại
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;
        END IF;
      END $$;
    `);
    
    // Tạo bảng user_sessions nếu chưa tồn tại
    console.log('Tạo bảng user_sessions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid VARCHAR(255) NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS IDX_user_sessions_expire ON user_sessions (expire);
    `);
    
    // Tạo bảng user_addresses
    console.log('Tạo bảng user_addresses...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        address TEXT NOT NULL,
        ward VARCHAR(100),
        district VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS IDX_user_addresses_user_id ON user_addresses (user_id);
    `);
    
    // Tạo bảng shipping_addresses (lưu trữ địa chỉ giao hàng khi đặt đơn)
    console.log('Tạo bảng shipping_addresses...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipping_addresses (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        address TEXT NOT NULL,
        ward VARCHAR(100),
        district VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Tạo bảng orders
    console.log('Tạo bảng orders...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        order_number VARCHAR(20) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method JSONB NOT NULL,
        shipping_method JSONB NOT NULL,
        shipping_address_id INTEGER NOT NULL REFERENCES shipping_addresses(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        processed_at TIMESTAMP,
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT
      );
      
      CREATE INDEX IF NOT EXISTS IDX_orders_user_id ON orders (user_id);
      CREATE INDEX IF NOT EXISTS IDX_orders_order_number ON orders (order_number);
      CREATE INDEX IF NOT EXISTS IDX_orders_status ON orders (status);
    `);
    
    // Tạo bảng order_products
    console.log('Tạo bảng order_products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_products (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        variant TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS IDX_order_products_order_id ON order_products (order_id);
      CREATE INDEX IF NOT EXISTS IDX_order_products_product_id ON order_products (product_id);
    `);
    
    // Tạo bảng wishlist
    console.log('Tạo bảng wishlist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
      
      CREATE INDEX IF NOT EXISTS IDX_wishlist_user_id ON wishlist (user_id);
    `);
    
    // Tạo bảng password_reset_tokens
    console.log('Tạo bảng password_reset_tokens...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used BOOLEAN DEFAULT FALSE
      );
      
      CREATE INDEX IF NOT EXISTS IDX_password_reset_tokens_token ON password_reset_tokens (token);
      CREATE INDEX IF NOT EXISTS IDX_password_reset_tokens_user_id ON password_reset_tokens (user_id);
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Cập nhật cơ sở dữ liệu thành công!');
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await client.query('ROLLBACK');
    console.error('Lỗi khi cập nhật cơ sở dữ liệu:', err);
    throw err;
  } finally {
    // Giải phóng client
    client.release();
    // Đóng pool
    await pool.end();
  }
}

// Thực thi cập nhật
updateDatabase().then(() => {
  console.log('Script cập nhật cơ sở dữ liệu đã hoàn thành.');
}).catch(err => {
  console.error('Script cập nhật cơ sở dữ liệu thất bại:', err);
});