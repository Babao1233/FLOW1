/**
 * Service xử lý các tính năng tài khoản người dùng
 * Cung cấp các phương thức gọi API cho tính năng quản lý tài khoản
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
 * Service quản lý hồ sơ người dùng
 */
const profileService = {
  /**
   * Lấy thông tin hồ sơ người dùng
   * @returns {Promise} Thông tin người dùng
   */
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ người dùng
   * @param {Object} profileData - Dữ liệu hồ sơ cần cập nhật
   * @returns {Promise} Thông tin người dùng sau khi cập nhật
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  /**
   * Thay đổi mật khẩu
   * @param {Object} passwordData - Dữ liệu mật khẩu cũ và mới
   * @returns {Promise} Kết quả thay đổi mật khẩu
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * Yêu cầu khôi phục mật khẩu
   * @param {string} email - Email của tài khoản cần khôi phục mật khẩu
   * @returns {Promise} Kết quả yêu cầu
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/request-reset', { email });
    return response.data;
  },

  /**
   * Xác minh mã khôi phục mật khẩu
   * @param {string} code - Mã xác minh
   * @returns {Promise} Kết quả xác minh
   */
  verifyResetCode: async (code) => {
    const response = await apiClient.post('/auth/verify-reset-code', { code });
    return response.data;
  },

  /**
   * Đặt lại mật khẩu mới
   * @param {Object} resetData - Dữ liệu đặt lại mật khẩu
   * @returns {Promise} Kết quả đặt lại mật khẩu
   */
  resetPassword: async (resetData) => {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  },
};

/**
 * Service quản lý địa chỉ
 */
const addressService = {
  /**
   * Lấy danh sách địa chỉ
   * @returns {Promise} Danh sách địa chỉ
   */
  getAddresses: async () => {
    const response = await apiClient.get('/user/addresses');
    return response.data;
  },

  /**
   * Thêm địa chỉ mới
   * @param {Object} addressData - Dữ liệu địa chỉ
   * @returns {Promise} Địa chỉ sau khi thêm
   */
  addAddress: async (addressData) => {
    const response = await apiClient.post('/user/addresses', addressData);
    return response.data;
  },

  /**
   * Cập nhật địa chỉ
   * @param {number} id - ID địa chỉ
   * @param {Object} addressData - Dữ liệu địa chỉ
   * @returns {Promise} Địa chỉ sau khi cập nhật
   */
  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`/user/addresses/${id}`, addressData);
    return response.data;
  },

  /**
   * Xóa địa chỉ
   * @param {number} id - ID địa chỉ
   * @returns {Promise} Kết quả xóa
   */
  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/user/addresses/${id}`);
    return response.data;
  },

  /**
   * Đặt địa chỉ mặc định
   * @param {number} id - ID địa chỉ
   * @returns {Promise} Địa chỉ sau khi đặt mặc định
   */
  setDefaultAddress: async (id) => {
    const response = await apiClient.patch(`/user/addresses/${id}/set-default`);
    return response.data;
  },
};

/**
 * Service quản lý đơn hàng
 */
const orderService = {
  /**
   * Lấy danh sách đơn hàng
   * @param {Object} params - Tham số lọc và phân trang
   * @returns {Promise} Danh sách đơn hàng
   */
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/user/orders', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   * @param {number} id - ID đơn hàng
   * @returns {Promise} Chi tiết đơn hàng
   */
  getOrderById: async (id) => {
    const response = await apiClient.get(`/user/orders/${id}`);
    return response.data;
  },

  /**
   * Hủy đơn hàng
   * @param {number} id - ID đơn hàng
   * @param {string} reason - Lý do hủy
   * @returns {Promise} Kết quả hủy đơn hàng
   */
  cancelOrder: async (id, reason) => {
    const response = await apiClient.patch(`/user/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

/**
 * Service quản lý sản phẩm yêu thích
 */
const wishlistService = {
  /**
   * Lấy danh sách sản phẩm yêu thích
   * @returns {Promise} Danh sách sản phẩm yêu thích
   */
  getWishlist: async () => {
    const response = await apiClient.get('/user/wishlist');
    return response.data;
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   * @param {number} productId - ID sản phẩm
   * @returns {Promise} Kết quả thêm
   */
  addToWishlist: async (productId) => {
    const response = await apiClient.post('/user/wishlist', { productId });
    return response.data;
  },

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   * @param {number} productId - ID sản phẩm
   * @returns {Promise} Kết quả xóa
   */
  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(`/user/wishlist/${productId}`);
    return response.data;
  },
};

// Xuất các service
export const accountService = {
  profile: profileService,
  address: addressService,
  order: orderService,
  wishlist: wishlistService,
};

export default accountService;