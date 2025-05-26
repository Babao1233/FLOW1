/**
 * Cập nhật đường dẫn hình ảnh sản phẩm trong database
 * Script này chuyển đổi đường dẫn hình ảnh local sang URL placeholder
 */
const client = require('./database');

async function updateProductImages() {
  try {
    console.log('Đang kết nối đến database...');

    // Tạo mapping từ đường dẫn local sang URL placeholder
    const imageMapping = {
      'public/images/products/air-purifier-1.jpg': 'https://placehold.co/400x300/ef4444/ffffff?text=Air+Purifier+P9',
      'public/images/products/air-purifier-2.jpg': 'https://placehold.co/400x300/ef4444/ffffff?text=Air+Purifier+A8',
      'public/images/products/vacuum-1.jpg': 'https://placehold.co/400x300/22c55e/ffffff?text=Vacuum+R10',
      'public/images/products/vacuum-2.jpg': 'https://placehold.co/400x300/22c55e/ffffff?text=Vacuum+R8+Pro',
      'public/images/products/light-1.jpg': 'https://placehold.co/400x300/f97316/ffffff?text=Light+L5',
      'public/images/products/light-2.jpg': 'https://placehold.co/400x300/f97316/ffffff?text=Light+L8+RGB',
      'public/images/products/camera-1.jpg': 'https://placehold.co/400x300/3b82f6/ffffff?text=Camera+C10',
      'public/images/products/camera-2.jpg': 'https://placehold.co/400x300/3b82f6/ffffff?text=Camera+C8+Pro'
    };

    // Lấy danh sách sản phẩm có đường dẫn hình ảnh local
    const result = await client.query(
      `SELECT id, name, image FROM products 
       WHERE image LIKE 'public/images/products/%'`
    );

    console.log(`Tìm thấy ${result.rows.length} sản phẩm cần cập nhật.`);

    // Cập nhật từng sản phẩm
    for (const product of result.rows) {
      const oldImage = product.image;
      const newImage = imageMapping[oldImage];

      if (newImage) {
        await client.query(
          'UPDATE products SET image = $1 WHERE id = $2',
          [newImage, product.id]
        );
        console.log(`Đã cập nhật sản phẩm ID ${product.id} - ${product.name}:`);
        console.log(`  - Từ: ${oldImage}`);
        console.log(`  - Thành: ${newImage}`);
      } else {
        console.log(`Không tìm thấy mapping cho hình ảnh: ${oldImage}`);
      }
    }

    console.log('Cập nhật hoàn tất!');
  } catch (err) {
    console.error('Lỗi khi cập nhật hình ảnh sản phẩm:', err);
  } finally {
    await client.end();
  }
}

updateProductImages(); 