const pool = require('../../database');

/**
 * Lấy danh sách sản phẩm với khả năng lọc, tìm kiếm và phân trang
 */
exports.getProducts = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'id', 
      order = 'ASC',
      page = 1,
      limit = 12
    } = req.query;
    
    // Xác thực tham số sắp xếp để tránh SQL Injection
    const allowedSortFields = ['id', 'name', 'price', 'salePrice', 'rating'];
    const allowedOrders = ['ASC', 'DESC'];
    
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    
    // Phân trang
    const offset = (page - 1) * limit;
    
    // Xây dựng truy vấn SQL
    let queryParams = [];
    let conditions = [];
    let paramIndex = 1;
    
    // Thêm điều kiện tìm kiếm
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      queryParams.push(category);
    }
    
    if (search) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      queryParams.push(`%${search}%`);
    }
    
    if (minPrice) {
      conditions.push(`salePrice >= $${paramIndex++}`);
      queryParams.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      conditions.push(`salePrice <= $${paramIndex++}`);
      queryParams.push(parseFloat(maxPrice));
    }
    
    // Xây dựng câu truy vấn SQL hoàn chỉnh
    let query = 'SELECT * FROM products';
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Đếm tổng số sản phẩm phù hợp với điều kiện lọc
    const countQuery = `SELECT COUNT(*) as total FROM products ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Thêm sắp xếp và phân trang
    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit));
    queryParams.push(parseInt(offset));
    
    // Thực hiện truy vấn
    const result = await pool.query(query, queryParams);
    
    // Lấy danh sách các danh mục duy nhất
    const categoriesResult = await pool.query('SELECT DISTINCT category FROM products');
    const categories = categoriesResult.rows.map(row => row.category);
    
    // Trả về kết quả với metadata phân trang
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      categories
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách sản phẩm.' 
    });
  }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Xác thực ID là một số
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID sản phẩm không hợp lệ.' 
      });
    }
    
    // Lấy thông tin sản phẩm
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy sản phẩm.' 
      });
    }
    
    // Lấy các sản phẩm liên quan (cùng danh mục)
    const relatedProductsResult = await pool.query(
      'SELECT * FROM products WHERE category = $1 AND id != $2 ORDER BY rating DESC LIMIT 4',
      [result.rows[0].category, id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      relatedProducts: relatedProductsResult.rows
    });
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm.' 
    });
  }
};

/**
 * Lấy danh sách danh mục sản phẩm
 */
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        category, 
        COUNT(*) as product_count, 
        MIN(salePrice) as min_price, 
        MAX(salePrice) as max_price
      FROM products 
      GROUP BY category
      ORDER BY category
    `);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách danh mục:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách danh mục.' 
    });
  }
};

/**
 * Lấy sản phẩm nổi bật
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    // Lấy top 6 sản phẩm có rating cao nhất
    const result = await pool.query(`
      SELECT * FROM products 
      ORDER BY rating DESC 
      LIMIT 6
    `);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm nổi bật:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi lấy sản phẩm nổi bật.' 
    });
  }
};