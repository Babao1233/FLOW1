/**
 * Service xử lý các tính năng liên quan đến đánh giá sản phẩm
 * Quản lý các API liên quan đến đánh giá, bình luận cho sản phẩm
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Tạo instance axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi cookie trong yêu cầu CORS
});

// Xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || 'Đã xảy ra lỗi khi xử lý đánh giá, vui lòng thử lại sau.',
    };
    return Promise.reject(customError);
  }
);

/**
 * Service quản lý đánh giá sản phẩm
 */
const reviewService = {
  /**
   * Lấy tất cả đánh giá của một sản phẩm
   * @param {number} productId - ID sản phẩm
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise} Danh sách đánh giá
   */
  getProductReviews: async (productId, params = {}) => {
    const response = await apiClient.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  /**
   * Lấy thống kê đánh giá của một sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise} Thống kê đánh giá (số lượng đánh giá mỗi sao, điểm trung bình)
   */
  getReviewStats: async (productId) => {
    const response = await apiClient.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  /**
   * Thêm đánh giá mới cho sản phẩm
   * @param {Object} reviewData - Dữ liệu đánh giá (productId, rating, content, title)
   * @returns {Promise} Đánh giá sau khi được thêm
   */
  addReview: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  /**
   * Cập nhật đánh giá hiện có
   * @param {number} reviewId - ID đánh giá
   * @param {Object} reviewData - Dữ liệu đánh giá cập nhật
   * @returns {Promise} Đánh giá sau khi cập nhật
   */
  updateReview: async (reviewId, reviewData) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  /**
   * Xóa đánh giá
   * @param {number} reviewId - ID đánh giá
   * @returns {Promise} Kết quả xóa
   */
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Đánh dấu đánh giá là hữu ích
   * @param {number} reviewId - ID đánh giá
   * @returns {Promise} Đánh giá sau khi cập nhật
   */
  markReviewHelpful: async (reviewId) => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  /**
   * Báo cáo đánh giá không phù hợp
   * @param {number} reviewId - ID đánh giá
   * @param {string} reason - Lý do báo cáo
   * @returns {Promise} Kết quả báo cáo
   */
  reportReview: async (reviewId, reason) => {
    const response = await apiClient.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  /**
   * Lấy tất cả đánh giá của người dùng hiện tại
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise} Danh sách đánh giá của người dùng
   */
  getUserReviews: async (params = {}) => {
    const response = await apiClient.get('/reviews/user', { params });
    return response.data;
  },

  /**
   * Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
   * @param {number} productId - ID sản phẩm
   * @returns {Promise} Thông tin về đánh giá nếu đã tồn tại
   */
  checkUserReview: async (productId) => {
    const response = await apiClient.get(`/reviews/check/${productId}`);
    return response.data;
  },

  /**
   * Lấy các đánh giá gần đây nhất trên toàn hệ thống
   * @param {number} limit - Số lượng đánh giá muốn lấy
   * @returns {Promise} Danh sách đánh giá gần đây
   */
  getRecentReviews: async (limit = 5) => {
    const response = await apiClient.get('/reviews/recent', { params: { limit } });
    return response.data;
  },

  /**
   * Lấy các đánh giá nổi bật
   * @param {number} limit - Số lượng đánh giá muốn lấy
   * @returns {Promise} Danh sách đánh giá nổi bật
   */
  getFeaturedReviews: async (limit = 5) => {
    const response = await apiClient.get('/reviews/featured', { params: { limit } });
    return response.data;
  },

  /**
   * Tải lên hình ảnh cho đánh giá
   * @param {number} reviewId - ID đánh giá
   * @param {File} imageFile - File hình ảnh
   * @returns {Promise} Thông tin hình ảnh sau khi tải lên
   */
  uploadReviewImage: async (reviewId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post(`/reviews/${reviewId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Xóa hình ảnh của đánh giá
   * @param {number} reviewId - ID đánh giá
   * @param {number} imageId - ID hình ảnh
   * @returns {Promise} Kết quả xóa
   */
  deleteReviewImage: async (reviewId, imageId) => {
    const response = await apiClient.delete(`/reviews/${reviewId}/images/${imageId}`);
    return response.data;
  }
};

export default reviewService;
