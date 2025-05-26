/**
 * Script nâng cấp cơ sở dữ liệu
 * Chạy migrations và cập nhật schema
 */

const { runMigrations } = require('./src/database/migrations');
const pool = require('./database');

async function upgradeDatabase() {
  console.log('Bắt đầu nâng cấp cơ sở dữ liệu...');
  
  try {
    // Kiểm tra kết nối cơ sở dữ liệu
    await pool.query('SELECT NOW()');
    console.log('✅ Kết nối cơ sở dữ liệu thành công.');
    
    // Chạy migrations
    console.log('Đang chạy migrations...');
    await runMigrations();
    
    console.log('✅ Nâng cấp cơ sở dữ liệu hoàn tất.');
  } catch (err) {
    console.error('❌ Lỗi khi nâng cấp cơ sở dữ liệu:', err);
    process.exit(1);
  } finally {
    // Đóng kết nối để thoát script
    await pool.end();
  }
}

// Chạy script
upgradeDatabase();