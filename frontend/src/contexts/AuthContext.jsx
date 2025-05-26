import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Tạo context xác thực
const AuthContext = createContext();

// URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Provider cung cấp context xác thực cho toàn bộ ứng dụng
 * Quản lý trạng thái đăng nhập, đăng ký, đăng xuất và xác thực người dùng
 */
export const AuthProvider = ({ children }) => {
  // Trạng thái người dùng
  const [user, setUser] = useState(null);
  
  // Trạng thái loading
  const [loading, setLoading] = useState(true);
  
  // Trạng thái lỗi
  const [error, setError] = useState(null);

  // Kiểm tra trạng thái đăng nhập khi component được mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/auth/status`, {
          withCredentials: true,
        });
        
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái xác thực:', err);
        setUser(null);
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Dữ liệu đăng ký
   * @returns {Promise} Kết quả đăng ký
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        withCredentials: true,
      });
      
      // Thường sau khi đăng ký, người dùng vẫn phải đăng nhập
      // Tuy nhiên, nếu API tự động đăng nhập sau khi đăng ký, có thể set user tại đây
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập
   * @returns {Promise} Kết quả đăng nhập
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
      });
      
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đăng xuất người dùng
   * @returns {Promise} Kết quả đăng xuất
   */
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      
      setUser(null);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng xuất thất bại. Vui lòng thử lại.';
      console.error('Lỗi khi đăng xuất:', errorMessage);
      // Mặc dù có lỗi khi gọi API đăng xuất, chúng ta vẫn xóa thông tin người dùng ở phía client
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật thông tin người dùng trong context
   * @param {Object} userData - Thông tin người dùng cập nhật
   */
  const updateUserInfo = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  // Giá trị context cung cấp cho toàn bộ ứng dụng
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUserInfo,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export default AuthContext;