/**
 * Dọn dẹp database
 * Script này xóa các sản phẩm trùng lặp trong database
 */
const client = require('./database');

async function cleanupDatabase() {
  try {
    console.log('Đang kết nối đến database...');

    // Tìm các sản phẩm trùng lặp theo tên
    const result = await client.query(`
      SELECT name, COUNT(*) as count
      FROM products
      GROUP BY name
      HAVING COUNT(*) > 1
    `);

    console.log(`Tìm thấy ${result.rows.length} sản phẩm trùng lặp.`);

    // Xóa các sản phẩm trùng lặp
    for (const product of result.rows) {
      const productName = product.name;
      console.log(`Xử lý sản phẩm trùng lặp: ${productName}`);

      // Lấy danh sách ID của sản phẩm trùng lặp
      const duplicates = await client.query(
        'SELECT id FROM products WHERE name = $1 ORDER BY id',
        [productName]
      );

      // Giữ lại ID nhỏ nhất (sản phẩm đầu tiên), xóa các ID còn lại
      const ids = duplicates.rows.map(row => row.id);
      const keepId = Math.min(...ids);
      const deleteIds = ids.filter(id => id !== keepId);

      if (deleteIds.length > 0) {
        console.log(`  - Giữ lại sản phẩm ID ${keepId}`);
        console.log(`  - Xóa các sản phẩm ID: ${deleteIds.join(', ')}`);

        // Xóa các sản phẩm trùng lặp
        await client.query(
          'DELETE FROM products WHERE id = ANY($1)',
          [deleteIds]
        );
      }
    }

    console.log('Dọn dẹp database hoàn tất!');
  } catch (err) {
    console.error('Lỗi khi dọn dẹp database:', err);
  } finally {
    await client.end();
  }
}

cleanupDatabase(); 