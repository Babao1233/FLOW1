const client = require('./database');

/**
 * Thêm dữ liệu mẫu vào database
 * Hàm này sẽ thêm các sản phẩm và liên hệ mẫu vào database
 */
async function seedDatabase() {
  try {
    // Thêm dữ liệu sản phẩm mẫu
    await client.query(`
      INSERT INTO products (name, price, salePrice, category, image, rating)
      VALUES 
        ('Máy lọc không khí Yapee P9', 3990000, 2990000, 'air-purifier', 'https://placehold.co/400x300/ef4444/ffffff?text=Air+Purifier+P9', 4.8),
        ('Máy lọc không khí Yapee A8', 4990000, 3990000, 'air-purifier', 'https://placehold.co/400x300/ef4444/ffffff?text=Air+Purifier+A8', 4.9),
        ('Robot hút bụi Yapee R10', 7990000, 6990000, 'vacuum', 'https://placehold.co/400x300/22c55e/ffffff?text=Vacuum+R10', 4.7),
        ('Robot hút bụi Yapee R8 Pro', 5990000, 4990000, 'vacuum', 'https://placehold.co/400x300/22c55e/ffffff?text=Vacuum+R8+Pro', 4.5),
        ('Đèn thông minh Yapee L5', 1290000, 990000, 'lighting', 'https://placehold.co/400x300/f97316/ffffff?text=Light+L5', 4.6),
        ('Đèn thông minh Yapee L8 RGB', 1990000, 1590000, 'lighting', 'https://placehold.co/400x300/f97316/ffffff?text=Light+L8+RGB', 4.7),
        ('Camera an ninh Yapee C10', 2990000, 2490000, 'security', 'https://placehold.co/400x300/3b82f6/ffffff?text=Camera+C10', 4.8),
        ('Camera an ninh Yapee C8 Pro', 3990000, 3490000, 'security', 'https://placehold.co/400x300/3b82f6/ffffff?text=Camera+C8+Pro', 4.9)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Thêm dữ liệu liên hệ mẫu
    await client.query(`
      INSERT INTO contacts (name, email, message)
      VALUES 
        ('Nguyễn Văn A', 'nguyenvana@example.com', 'Tôi muốn biết thêm về sản phẩm máy lọc không khí.'),
        ('Trần Thị B', 'tranthib@example.com', 'Làm thế nào để đặt hàng sản phẩm của Yapee?'),
        ('Lê Văn C', 'levanc@example.com', 'Tôi cần hỗ trợ kỹ thuật cho robot hút bụi.')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    // Không đóng kết nối để có thể sử dụng trong các tác vụ khác
    // await client.end();
  }
}

seedDatabase();