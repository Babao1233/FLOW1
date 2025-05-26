/**
 * Script nâng cấp cấu trúc cơ sở dữ liệu Yapee Vietnam
 * Thực hiện các cải tiến theo đề xuất:
 * 1. Tạo bảng product_categories
 * 2. Tạo bảng product_reviews
 * 3. Tạo bảng product_images
 * 4. Thêm khóa ngoại user_id cho bảng shipping_addresses
 */

const pool = require('./database');

async function enhanceDatabaseStructure() {
  const client = await pool.connect();
  
  try {
    // Bắt đầu transaction
    await client.query('BEGIN');
    
    console.log('Bắt đầu nâng cấp cấu trúc cơ sở dữ liệu...');
    
    // 1. Tạo bảng product_categories
    console.log('Tạo bảng product_categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES product_categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tạo chỉ mục cho parent_id để tối ưu truy vấn phân cấp
      CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
      
      -- Tạo chỉ mục cho slug để tối ưu truy vấn URL
      CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
    `);
    
    // 2. Tạo bảng product_reviews
    console.log('Tạo bảng product_reviews...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title VARCHAR(255),
        comment TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      
      -- Tạo chỉ mục cho product_id để tối ưu truy vấn tìm đánh giá theo sản phẩm
      CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
      
      -- Tạo chỉ mục cho user_id để tối ưu truy vấn tìm đánh giá theo người dùng
      CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
      
      -- Tạo ràng buộc unique để người dùng chỉ có thể đánh giá một sản phẩm một lần
      ALTER TABLE product_reviews 
      ADD CONSTRAINT uq_product_reviews_user_product UNIQUE (user_id, product_id);
    `);
    
    // 3. Tạo bảng product_images
    console.log('Tạo bảng product_images...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        alt_text VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tạo chỉ mục cho product_id để tối ưu truy vấn tìm hình ảnh theo sản phẩm
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
      
      -- Tạo chỉ mục cho is_primary để tối ưu truy vấn tìm hình ảnh chính
      CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
    `);
    
    // 4. Thêm khóa ngoại user_id cho bảng shipping_addresses
    console.log('Thêm khóa ngoại user_id cho bảng shipping_addresses...');
    await client.query(`
      DO $$
      BEGIN
        -- Kiểm tra xem cột user_id đã tồn tại trong bảng shipping_addresses chưa
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'shipping_addresses' AND column_name = 'user_id'
        ) THEN
          -- Thêm cột user_id
          ALTER TABLE shipping_addresses ADD COLUMN user_id INTEGER;
          
          -- Thêm ràng buộc khóa ngoại
          ALTER TABLE shipping_addresses 
          ADD CONSTRAINT fk_shipping_addresses_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          
          -- Tạo chỉ mục cho user_id
          CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
        END IF;
      END $$;
    `);
    
    // 5. Cập nhật bảng products để liên kết với categories
    console.log('Cập nhật bảng products để liên kết với categories...');
    await client.query(`
      DO $$
      BEGIN
        -- Kiểm tra xem cột category_id đã tồn tại trong bảng products chưa
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
        ) THEN
          -- Thêm cột category_id
          ALTER TABLE products ADD COLUMN category_id INTEGER;
          
          -- Thêm ràng buộc khóa ngoại
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_category_id 
          FOREIGN KEY (category_id) REFERENCES product_categories(id);
          
          -- Tạo chỉ mục cho category_id
          CREATE INDEX idx_products_category_id ON products(category_id);
        END IF;
      END $$;
    `);
    
    // 6. Thêm dữ liệu mẫu cho categories từ các giá trị category hiện có
    console.log('Thêm dữ liệu mẫu cho bảng product_categories...');
    await client.query(`
      -- Lấy các category hiện có từ bảng products
      INSERT INTO product_categories (name, slug, description)
      SELECT DISTINCT category, 
                      LOWER(REPLACE(category, '-', '_')), 
                      'Danh mục sản phẩm ' || category
      FROM products
      WHERE category IS NOT NULL
      ON CONFLICT (slug) DO NOTHING;
      
      -- Cập nhật liên kết category_id trong bảng products
      UPDATE products p
      SET category_id = c.id
      FROM product_categories c
      WHERE p.category = c.name
      AND p.category_id IS NULL;
    `);
    
    // 7. Thêm dữ liệu mẫu cho bảng product_images từ trường image trong bảng products
    console.log('Thêm dữ liệu mẫu cho bảng product_images...');
    await client.query(`
      -- Thêm hình ảnh chính từ trường image của products
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
      SELECT id, image, name, TRUE
      FROM products
      WHERE image IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Nâng cấp cấu trúc cơ sở dữ liệu thành công!');
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await client.query('ROLLBACK');
    console.error('Lỗi khi nâng cấp cấu trúc cơ sở dữ liệu:', err);
    throw err;
  } finally {
    // Giải phóng client
    client.release();
    // Đóng pool
    await pool.end();
  }
}

// Thực thi nâng cấp
enhanceDatabaseStructure().then(() => {
  console.log('Script nâng cấp cấu trúc cơ sở dữ liệu đã hoàn thành.');
}).catch(err => {
  console.error('Script nâng cấp cấu trúc cơ sở dữ liệu thất bại:', err);
});
