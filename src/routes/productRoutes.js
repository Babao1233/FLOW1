const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Lấy danh sách danh mục sản phẩm
router.get('/categories', productController.getCategories);

// Lấy sản phẩm nổi bật
router.get('/featured', productController.getFeaturedProducts);

// Lấy danh sách sản phẩm (có hỗ trợ lọc, tìm kiếm, phân trang)
router.get('/', productController.getProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

module.exports = router;