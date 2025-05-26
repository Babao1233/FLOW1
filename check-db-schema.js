const pool = require('./database');

async function checkDatabaseSchema() {
  try {
    console.log('Kết nối đến cơ sở dữ liệu PostgreSQL...');
    
    // Kiểm tra danh sách các bảng
    console.log('\n=== DANH SÁCH CÁC BẢNG ===');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('Không tìm thấy bảng nào trong cơ sở dữ liệu.');
    } else {
      tablesResult.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Duyệt qua từng bảng và hiển thị cấu trúc cột
    console.log('\n=== CHI TIẾT CỘT CỦA CÁC BẢNG ===');
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\nBảng: ${tableName}`);
      
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, 
               is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      if (columnsResult.rows.length === 0) {
        console.log('  Không tìm thấy cột nào.');
      } else {
        console.log('  TÊN CỘT | KIỂU DỮ LIỆU | NULL? | MẶC ĐỊNH');
        console.log('  ' + '-'.repeat(60));
        columnsResult.rows.forEach(column => {
          const columnName = column.column_name;
          const dataType = column.data_type + 
            (column.character_maximum_length ? `(${column.character_maximum_length})` : '');
          const isNullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = column.column_default || 'NULL';
          
          console.log(`  ${columnName.padEnd(15)} | ${dataType.padEnd(15)} | ${isNullable.padEnd(8)} | ${defaultValue}`);
        });
      }
      
      // Kiểm tra các ràng buộc khóa chính và khóa ngoại
      const primaryKeyResult = await pool.query(`
        SELECT c.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
        JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1;
      `, [tableName]);
      
      if (primaryKeyResult.rows.length > 0) {
        console.log('\n  Khóa chính:');
        primaryKeyResult.rows.forEach(row => {
          console.log(`  - ${row.column_name}`);
        });
      }
      
      const foreignKeysResult = await pool.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `, [tableName]);
      
      if (foreignKeysResult.rows.length > 0) {
        console.log('\n  Khóa ngoại:');
        foreignKeysResult.rows.forEach(row => {
          console.log(`  - ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
        });
      }
    }
    
    // Kiểm tra các indexes
    console.log('\n=== CHỈ MỤC (INDEXES) ===');
    const indexesResult = await pool.query(`
      SELECT
        t.relname AS table_name,
        i.relname AS index_name,
        a.attname AS column_name
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relkind = 'r'
      AND n.nspname = 'public'
      ORDER BY t.relname, i.relname;
    `);
    
    if (indexesResult.rows.length === 0) {
      console.log('Không tìm thấy chỉ mục nào trong cơ sở dữ liệu.');
    } else {
      let currentTable = '';
      let currentIndex = '';
      
      indexesResult.rows.forEach(row => {
        if (row.table_name !== currentTable) {
          currentTable = row.table_name;
          console.log(`\nBảng: ${currentTable}`);
          currentIndex = '';
        }
        
        if (row.index_name !== currentIndex) {
          currentIndex = row.index_name;
          console.log(`  Chỉ mục: ${currentIndex}`);
        }
        
        console.log(`    - Cột: ${row.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra cấu trúc cơ sở dữ liệu:', error);
  } finally {
    await pool.end();
    console.log('\nĐã đóng kết nối đến cơ sở dữ liệu.');
  }
}

// Chạy hàm kiểm tra
checkDatabaseSchema();
