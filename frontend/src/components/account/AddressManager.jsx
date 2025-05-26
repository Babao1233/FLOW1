import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';

/**
 * Component quản lý địa chỉ giao hàng
 * Cho phép người dùng xem, thêm, sửa và xóa địa chỉ giao hàng
 */
const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  
  // Lấy danh sách địa chỉ khi component mount
  useEffect(() => {
    fetchAddresses();
  }, []);
  
  // Hàm lấy danh sách địa chỉ từ API
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await accountService.address.getAddresses();
      setAddresses(response.addresses || []);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy danh sách địa chỉ:', err);
      setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Danh sách tỉnh/thành phố Việt Nam (rút gọn)
  const provinces = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ].sort();

  // Xử lý khi thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên người nhận';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
    }
    
    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện';
    }
    
    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi mở form thêm địa chỉ mới
  const handleAddNew = () => {
    setEditingAddressId(null);
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      province: '',
      isDefault: addresses.length === 0 // Mặc định là địa chỉ mặc định nếu chưa có địa chỉ nào
    });
    setErrors({});
    setShowAddForm(true);
  };

  // Xử lý khi mở form chỉnh sửa địa chỉ
  const handleEdit = (address) => {
    setEditingAddressId(address.id);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      ward: address.ward || '',
      district: address.district,
      province: address.province,
      isDefault: address.isDefault
    });
    setErrors({});
    setShowAddForm(true);
  };

  // Xử lý khi hủy thêm/sửa địa chỉ
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddressId(null);
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingAddressId) {
        // Cập nhật địa chỉ hiện tại
        await accountService.address.updateAddress(editingAddressId, formData);
      } else {
        // Thêm địa chỉ mới
        await accountService.address.addAddress(formData);
      }
      
      // Cập nhật danh sách địa chỉ
      fetchAddresses();
      
      // Đóng form và reset dữ liệu
      handleCancel();
    } catch (err) {
      console.error('Lỗi khi lưu địa chỉ:', err);
      setErrors({
        ...errors,
        general: err.message || 'Không thể lưu địa chỉ. Vui lòng thử lại sau.'
      });
    }
  };

  // Xử lý khi xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await accountService.address.deleteAddress(addressId);
        // Cập nhật danh sách địa chỉ sau khi xóa
        fetchAddresses();
      } catch (err) {
        console.error('Lỗi khi xóa địa chỉ:', err);
        setError(err.message || 'Không thể xóa địa chỉ. Vui lòng thử lại sau.');
      }
    }
  };

  // Xử lý khi đặt địa chỉ mặc định
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await accountService.address.setDefaultAddress(addressId);
      // Cập nhật danh sách địa chỉ sau khi đặt mặc định
      fetchAddresses();
    } catch (err) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', err);
      setError(err.message || 'Không thể đặt địa chỉ mặc định. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Danh sách địa chỉ */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className={`border rounded-lg p-4 ${address.isDefault ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-gray-800 font-medium">{address.fullName}</h3>
                    {address.isDefault && (
                      <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.phone}</p>
                  <p className="text-gray-600 mt-2">
                    {address.address}, {address.ward}, {address.district}, {address.province}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={address.isDefault}
                  >
                    <svg className={`w-5 h-5 ${address.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {!address.isDefault && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleSetDefaultAddress(address.id)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Đặt làm địa chỉ mặc định
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-2 text-gray-600">Bạn chưa có địa chỉ giao hàng nào</p>
        </div>
      )}
      
      {/* Nút thêm địa chỉ mới */}
      {!showAddForm && (
        <div className="flex justify-end">
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm địa chỉ mới
          </button>
        </div>
      )}
      
      {/* Form thêm/sửa địa chỉ */}
      {showAddForm && (
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="text-lg font-medium mb-4">
            {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập họ và tên người nhận"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>
            
            {/* Số điện thoại */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập số điện thoại liên hệ"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            
            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Số nhà, tên đường"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            
            {/* Phường/Xã */}
            <div>
              <label htmlFor="ward" className="block text-gray-700 font-medium mb-2">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.ward ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập phường/xã"
              />
              {errors.ward && (
                <p className="text-red-600 text-sm mt-1">{errors.ward}</p>
              )}
            </div>
            
            {/* Quận/Huyện */}
            <div>
              <label htmlFor="district" className="block text-gray-700 font-medium mb-2">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập quận/huyện"
              />
              {errors.district && (
                <p className="text-red-600 text-sm mt-1">{errors.district}</p>
              )}
            </div>
            
            {/* Tỉnh/Thành phố */}
            <div>
              <label htmlFor="province" className="block text-gray-700 font-medium mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-red-600 text-sm mt-1">{errors.province}</p>
              )}
            </div>
            
            {/* Địa chỉ mặc định */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="isDefault" className="ml-2 block text-gray-700">
                Đặt làm địa chỉ mặc định
              </label>
            </div>
            
            {/* Nút lưu và hủy */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
              >
                Lưu địa chỉ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressManager;