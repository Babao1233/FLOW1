import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { accountService } from '../../services/accountService';

/**
 * Component form đổi mật khẩu
 * Cho phép người dùng thay đổi mật khẩu của tài khoản
 */
const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });
  
  // Xử lý khi thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Xóa thông báo thành công khi người dùng thay đổi dữ liệu
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
    
    // Kiểm tra độ mạnh mật khẩu nếu đang nhập trường newPassword
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  // Kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '' });
      return;
    }
    
    let score = 0;
    let message = '';
    
    // Độ dài
    if (password.length >= 8) score++;
    
    // Chữ hoa
    if (/[A-Z]/.test(password)) score++;
    
    // Chữ thường
    if (/[a-z]/.test(password)) score++;
    
    // Số
    if (/[0-9]/.test(password)) score++;
    
    // Ký tự đặc biệt
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Đánh giá độ mạnh
    if (score <= 2) {
      message = 'Yếu';
    } else if (score <= 3) {
      message = 'Trung bình';
    } else {
      message = 'Mạnh';
    }
    
    setPasswordStrength({ score, message });
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một chữ số';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu để gửi đến API
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };
      
      // Gọi API đổi mật khẩu
      await accountService.profile.changePassword(passwordData);
      
      // Hiển thị thông báo thành công
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordStrength({
        score: 0,
        message: ''
      });
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      setErrors({
        ...errors,
        general: error.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị màu thanh độ mạnh mật khẩu
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông báo lỗi chung */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      {/* Thông báo cập nhật thành công */}
      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Đổi mật khẩu thành công!
        </div>
      )}
      
      {/* Mật khẩu hiện tại */}
      <div>
        <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
          Mật khẩu hiện tại <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập mật khẩu hiện tại"
        />
        {errors.currentPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>
      
      {/* Mật khẩu mới */}
      <div>
        <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
          Mật khẩu mới <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            errors.newPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập mật khẩu mới"
        />
        {formData.newPassword && (
          <div className="mt-2">
            <div className="h-2 rounded-full overflow-hidden bg-gray-200">
              <div 
                className={`h-full ${getPasswordStrengthColor()}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-1 ${
              passwordStrength.score <= 2 ? 'text-red-600' : 
              passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {passwordStrength.message}
            </p>
          </div>
        )}
        {errors.newPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
        )}
        <p className="text-gray-600 text-sm mt-1">
          Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
        </p>
      </div>
      
      {/* Xác nhận mật khẩu mới */}
      <div>
        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
          Xác nhận mật khẩu mới <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập lại mật khẩu mới"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>
      
      {/* Nút đổi mật khẩu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md font-medium text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;