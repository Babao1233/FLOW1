const pool = require('./database');
const bcrypt = require('bcryptjs');

/**
 * Script thêm dữ liệu mẫu cho các bảng liên quan đến tài khoản người dùng
 */
async function seedAccountData() {
  const client = await pool.connect();
  
  try {
    // Bắt đầu transaction
    await client.query('BEGIN');
    
    console.log('Bắt đầu thêm dữ liệu mẫu cho tài khoản...');
    
    // Tạo mật khẩu mã hóa cho tài khoản mẫu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    // Thêm người dùng mẫu
    console.log('Thêm người dùng mẫu...');
    const usersResult = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, phone, avatar_url, role, created_at)
      VALUES 
        ('nguyenvana', 'nguyenvana@example.com', $1, 'Nguyễn Văn A', '0901234567', 'https://placehold.co/100x100?text=NVA', 'user', NOW()),
        ('tranthib', 'tranthib@example.com', $1, 'Trần Thị B', '0912345678', 'https://placehold.co/100x100?text=TTB', 'user', NOW()),
        ('phamvanc', 'phamvanc@example.com', $1, 'Phạm Văn C', '0923456789', 'https://placehold.co/100x100?text=PVC', 'user', NOW()),
        ('admin', 'admin@yapee.vn', $1, 'Admin Yapee', '0989888777', 'https://placehold.co/100x100?text=Admin', 'admin', NOW())
      ON CONFLICT (username) DO UPDATE 
      SET email = EXCLUDED.email, 
          password_hash = EXCLUDED.password_hash,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          avatar_url = EXCLUDED.avatar_url,
          role = EXCLUDED.role
      RETURNING id;
    `, [passwordHash]);
    
    // Lấy ID của người dùng đầu tiên để sử dụng cho các bảng khác
    const userId1 = usersResult.rows[0].id;
    const userId2 = usersResult.rows[1].id;
    
    // Thêm địa chỉ người dùng mẫu
    console.log('Thêm địa chỉ người dùng mẫu...');
    await client.query(`
      INSERT INTO user_addresses (user_id, is_default, full_name, phone, address, ward, district, province)
      VALUES 
        ($1, TRUE, 'Nguyễn Văn A', '0901234567', '123 Đường ABC', 'Phường 1', 'Quận 1', 'TP. Hồ Chí Minh'),
        ($1, FALSE, 'Nguyễn Văn A', '0901234567', '456 Đường XYZ', 'Phường 2', 'Quận 2', 'TP. Hồ Chí Minh'),
        ($2, TRUE, 'Trần Thị B', '0912345678', '789 Đường DEF', 'Phường Cầu Ông Lãnh', 'Quận 1', 'TP. Hồ Chí Minh')
      ON CONFLICT DO NOTHING;
    `, [userId1, userId2]);
    
    // Thêm địa chỉ giao hàng mẫu
    console.log('Thêm địa chỉ giao hàng mẫu...');
    const shippingAddressResult = await client.query(`
      INSERT INTO shipping_addresses (full_name, phone, address, ward, district, province)
      VALUES 
        ('Nguyễn Văn A', '0901234567', '123 Đường ABC', 'Phường 1', 'Quận 1', 'TP. Hồ Chí Minh')
      RETURNING id;
    `);
    
    const shippingAddressId = shippingAddressResult.rows[0].id;
    
    // Lấy ID của một số sản phẩm mẫu
    const productsResult = await client.query(`
      SELECT id, price FROM products LIMIT 3;
    `);
    
    if (productsResult.rows.length > 0) {
      // Thêm đơn hàng mẫu
      console.log('Thêm đơn hàng mẫu...');
      const ordersResult = await client.query(`
        INSERT INTO orders (
          user_id, order_number, status, subtotal, shipping_fee, discount, total, 
          payment_status, payment_method, shipping_method, shipping_address_id, 
          created_at, processed_at
        )
        VALUES 
          (
            $1, 'ORD-2025-00001', 'processing', 6980000, 30000, 0, 7010000, 
            'paid', '{"method": "card", "card_number": "xxxx-xxxx-xxxx-1234"}', 
            '{"method": "standard", "estimated_days": 3}', 
            $2, NOW(), NOW()
          ),
          (
            $1, 'ORD-2025-00002', 'delivered', 3990000, 30000, 0, 4020000, 
            'paid', '{"method": "cod", "amount": 4020000}', 
            '{"method": "express", "estimated_days": 1}', 
            $2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
          ),
          (
            $1, 'ORD-2025-00003', 'cancelled', 1590000, 30000, 0, 1620000, 
            'refunded', '{"method": "momo", "transaction_id": "MOMO123456"}', 
            '{"method": "standard", "estimated_days": 3}', 
            $2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'
          )
        RETURNING id;
      `, [userId1, shippingAddressId]);
      
      // Thêm chi tiết đơn hàng mẫu
      if (ordersResult.rows.length > 0) {
        console.log('Thêm chi tiết đơn hàng mẫu...');
        const orderId1 = ordersResult.rows[0].id;
        const orderId2 = ordersResult.rows[1].id;
        const orderId3 = ordersResult.rows[2].id;
        
        // Sản phẩm cho đơn hàng 1
        for (let i = 0; i < Math.min(2, productsResult.rows.length); i++) {
          const product = productsResult.rows[i];
          await client.query(`
            INSERT INTO order_products (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4);
          `, [orderId1, product.id, i + 1, product.price]);
        }
        
        // Sản phẩm cho đơn hàng 2
        if (productsResult.rows.length > 0) {
          const product = productsResult.rows[0];
          await client.query(`
            INSERT INTO order_products (order_id, product_id, quantity, price)
            VALUES ($1, $2, 1, $3);
          `, [orderId2, product.id, product.price]);
        }
        
        // Sản phẩm cho đơn hàng 3
        if (productsResult.rows.length > 1) {
          const product = productsResult.rows[1];
          await client.query(`
            INSERT INTO order_products (order_id, product_id, quantity, price)
            VALUES ($1, $2, 1, $3);
          `, [orderId3, product.id, product.price]);
        }
      }
      
      // Thêm sản phẩm yêu thích mẫu
      console.log('Thêm sản phẩm yêu thích mẫu...');
      for (let i = 0; i < Math.min(3, productsResult.rows.length); i++) {
        await client.query(`
          INSERT INTO wishlist (user_id, product_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, product_id) DO NOTHING;
        `, [userId1, productsResult.rows[i].id]);
      }
      
      // Thêm một sản phẩm yêu thích cho người dùng 2
      if (productsResult.rows.length > 0) {
        await client.query(`
          INSERT INTO wishlist (user_id, product_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, product_id) DO NOTHING;
        `, [userId2, productsResult.rows[0].id]);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Thêm dữ liệu mẫu thành công!');
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await client.query('ROLLBACK');
    console.error('Lỗi khi thêm dữ liệu mẫu:', err);
    throw err;
  } finally {
    // Giải phóng client
    client.release();
    // Đóng pool
    await pool.end();
  }
}

// Thực thi script
seedAccountData().then(() => {
  console.log('Script thêm dữ liệu mẫu tài khoản đã hoàn thành.');
}).catch(err => {
  console.error('Script thêm dữ liệu mẫu tài khoản thất bại:', err);
});
