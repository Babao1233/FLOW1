/**
 * Service xử lý các tính năng liên quan đến sản phẩm
 * Cung cấp các phương thức gọi API cho tính năng quản lý sản phẩm
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Tạo instance axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi cookie trong yêu cầu CORS
});

// Intercept response để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.',
    };
    return Promise.reject(customError);
  }
);

/**
 * Service quản lý sản phẩm
 */
const productService = {
  /**
   * Lấy danh sách sản phẩm với các tùy chọn lọc và phân trang
   * @param {Object} params - Các tham số lọc và phân trang
   * @returns {Promise} Danh sách sản phẩm
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm
   * @param {number} id - ID sản phẩm
   * @returns {Promise} Chi tiết sản phẩm
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Lấy các hình ảnh của sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise} Danh sách hình ảnh
   */
  getProductImages: async (productId) => {
    const response = await apiClient.get(`/products/${productId}/images`);
    return response.data;
  },

  /**
   * Lấy đánh giá của sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {Object} params - Các tham số lọc và phân trang
   * @returns {Promise} Danh sách đánh giá
   */
  getProductReviews: async (productId, params = {}) => {
    const response = await apiClient.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  /**
   * Thêm đánh giá cho sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {Object} reviewData - Dữ liệu đánh giá
   * @returns {Promise} Đánh giá sau khi thêm
   */
  addProductReview: async (productId, reviewData) => {
    const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Chỉnh sửa đánh giá sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {number} reviewId - ID đánh giá
   * @param {Object} reviewData - Dữ liệu đánh giá cập nhật
   * @returns {Promise} Đánh giá sau khi cập nhật
   */
  updateProductReview: async (productId, reviewId, reviewData) => {
    const response = await apiClient.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  /**
   * Xóa đánh giá sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {number} reviewId - ID đánh giá
   * @returns {Promise} Kết quả xóa
   */
  deleteProductReview: async (productId, reviewId) => {
    const response = await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Lấy danh sách danh mục sản phẩm
   * @returns {Promise} Danh sách danh mục
   */
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  /**
   * Lấy chi tiết danh mục
   * @param {string} slug - Slug của danh mục
   * @returns {Promise} Chi tiết danh mục
   */
  getCategoryBySlug: async (slug) => {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categorySlug - Slug của danh mục
   * @param {Object} params - Các tham số lọc và phân trang
   * @returns {Promise} Danh sách sản phẩm thuộc danh mục
   */
  getProductsByCategory: async (categorySlug, params = {}) => {
    const response = await apiClient.get(`/categories/${categorySlug}/products`, { params });
    return response.data;
  },

  /**
   * Tìm kiếm sản phẩm
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} params - Các tham số lọc và phân trang
   * @returns {Promise} Kết quả tìm kiếm
   */
  searchProducts: async (query, params = {}) => {
    const response = await apiClient.get('/products/search', { 
      params: { 
        query,
        ...params 
      } 
    });
    return response.data;
  },

  /**
   * Lấy các sản phẩm nổi bật
   * @param {number} limit - Số lượng sản phẩm muốn lấy
   * @returns {Promise} Danh sách sản phẩm nổi bật
   */
  getFeaturedProducts: async (limit = 8) => {
    const response = await apiClient.get('/products/featured', { 
      params: { limit } 
    });
    return response.data;
  },

  /**
   * Lấy các sản phẩm mới
   * @param {number} limit - Số lượng sản phẩm muốn lấy
   * @returns {Promise} Danh sách sản phẩm mới
   */
  getNewProducts: async (limit = 8) => {
    const response = await apiClient.get('/products/new', { 
      params: { limit } 
    });
    return response.data;
  },

  /**
   * Lấy các sản phẩm đang giảm giá
   * @param {number} limit - Số lượng sản phẩm muốn lấy
   * @returns {Promise} Danh sách sản phẩm đang giảm giá
   */
  getDiscountedProducts: async (limit = 8) => {
    const response = await apiClient.get('/products/discounted', { 
      params: { limit } 
    });
    return response.data;
  },

  /**
   * Lấy các sản phẩm tương tự
   * @param {number} productId - ID sản phẩm
   * @param {number} limit - Số lượng sản phẩm muốn lấy
   * @returns {Promise} Danh sách sản phẩm tương tự
   */
  getSimilarProducts: async (productId, limit = 4) => {
    const response = await apiClient.get(`/products/${productId}/similar`, { 
      params: { limit } 
    });
    return response.data;
  }
};

export default productService;
