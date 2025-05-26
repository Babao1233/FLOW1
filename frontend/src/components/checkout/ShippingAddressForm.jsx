import React from 'react';

/**
 * Component form thông tin địa chỉ giao hàng
 * Quản lý và xác thực thông tin người nhận và địa chỉ giao hàng
 */
const ShippingAddressForm = ({ formData, errors, handleChange, savedAddresses, setSavedAddressId }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
      
      {/* Địa chỉ đã lưu */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Địa chỉ đã lưu
          </label>
          <div className="grid grid-cols-1 gap-3">
            {savedAddresses.map((address) => (
              <div 
                key={address.id}
                className={`border rounded-md p-3 cursor-pointer ${
                  formData.savedAddressId === address.id 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:border-amber-400'
                }`}
                onClick={() => setSavedAddressId(address.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.savedAddressId === address.id}
                    onChange={() => setSavedAddressId(address.id)}
                    className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium">{address.fullName} - {address.phone}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {address.address}, {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div 
              className={`border rounded-md p-3 cursor-pointer ${
                formData.savedAddressId === 0 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-300 hover:border-amber-400'
              }`}
              onClick={() => setSavedAddressId(0)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={formData.savedAddressId === 0}
                  onChange={() => setSavedAddressId(0)}
                  className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <span className="ml-3">Sử dụng địa chỉ mới</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form địa chỉ mới hoặc khi không có địa chỉ đã lưu */}
      {(!savedAddresses || savedAddresses.length === 0 || formData.savedAddressId === 0) && (
        <>
          {/* Họ tên */}
          <div className="mb-4">
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
          <div className="mb-4">
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
          
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập địa chỉ email (tùy chọn)"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Địa chỉ */}
          <div className="mb-4">
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
              placeholder="Số nhà, đường, phường/xã"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          
          {/* Tỉnh/Thành phố */}
          <div className="mb-4">
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
          
          {/* Quận/Huyện */}
          <div className="mb-4">
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
          
          {/* Lưu địa chỉ */}
          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveAddress"
                name="saveAddress"
                checked={formData.saveAddress}
                onChange={handleChange}
                className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="saveAddress" className="ml-2 block text-gray-700">
                Lưu địa chỉ này cho lần sau
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShippingAddressForm;