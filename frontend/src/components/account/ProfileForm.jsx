import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { accountService } from '../../services/accountService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';
import '../../styles/animations.css';

/**
 * Component form thông tin cá nhân
 * Cho phép người dùng xem và cập nhật thông tin cá nhân
 */
const ProfileForm = () => {
  const { user, updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    avatar: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  // Cập nhật form khi dữ liệu user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        avatar: null
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // Xử lý khi thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files.length > 0) {
      setUploadingAvatar(true);
      setFormData({
        ...formData,
        avatar: files[0]
      });
      
      // Hiển thị preview avatar với animation
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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
      const profileData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email
      };
      
      // Gọi API cập nhật thông tin
      const response = await accountService.profile.updateProfile(profileData);
      
      // Cập nhật thông tin người dùng trong context
      updateUserInfo(response.user);
      
      // Hiển thị thông báo thành công
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
      setErrors({
        ...errors,
        general: error.message || 'Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa avatar
  const handleRemoveAvatar = () => {
    setFormData({
      ...formData,
      avatar: null
    });
    setAvatarPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {errors.general && (
        <Alert
          type="error"
          message={errors.general}
          dismissible={true}
          autoClose={5000}
        />
      )}
      
      {updateSuccess && (
        <Alert
          type="success"
          message="Thông tin cá nhân đã được cập nhật thành công!"
          dismissible={true}
          autoClose={3000}
        />
      )}
      
      {/* Avatar */}
      <div className="flex items-center space-x-6">
        <div className="shrink-0">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 relative">
            {uploadingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
                <Loading size="sm" color="primary" />
              </div>
            ) : null}
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar" 
                className={`h-full w-full object-cover transition-opacity ${uploadingAvatar ? 'opacity-50' : 'opacity-100'}`} 
              />
            ) : (
              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>
        </div>
        <div className="ml-5">
          <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            Chọn ảnh
          </label>
          <input
            id="avatar-upload"
            name="avatar"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG hoặc GIF. Tối đa 1MB.
          </p>
        </div>
        {avatarPreview && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Họ tên */}
      <div className={`transition-all duration-200 ${focusedField === 'fullName' ? 'scale-[1.01]' : ''}`}>
        <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
          Họ tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onFocus={() => setFocusedField('fullName')}
          onBlur={() => setFocusedField(null)}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
          placeholder="Nhập họ tên của bạn"
        />
        {errors.fullName && (
          <p className="text-red-600 text-sm mt-1 animate-slideInDown">{errors.fullName}</p>
        )}
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Địa chỉ email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập địa chỉ email"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>
      
      {/* Số điện thoại */}
      <div>
        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
          Số điện thoại
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập số điện thoại"
        />
        {errors.phone && (
          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
        )}
      </div>
      
      {/* Giới tính */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Giới tính
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center">
            <input
              id="gender-male"
              name="gender"
              type="radio"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
              className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
            />
            <label htmlFor="gender-male" className="ml-3 block text-gray-700">
              Nam
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="gender-female"
              name="gender"
              type="radio"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
              className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
            />
            <label htmlFor="gender-female" className="ml-3 block text-gray-700">
              Nữ
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="gender-other"
              name="gender"
              type="radio"
              value="other"
              checked={formData.gender === 'other'}
              onChange={handleChange}
              className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
            />
            <label htmlFor="gender-other" className="ml-3 block text-gray-700">
              Khác
            </label>
          </div>
        </div>
      </div>
      
      {/* Ngày sinh */}
      <div>
        <label htmlFor="birthday" className="block text-gray-700 font-medium mb-2">
          Ngày sinh
        </label>
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      
      {/* Nút lưu thay đổi */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          loadingText="Đang xử lý..."
          disabled={isSubmitting}
        >
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;