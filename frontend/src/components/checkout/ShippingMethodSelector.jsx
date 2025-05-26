import React from 'react';

/**
 * Component cho phép chọn phương thức vận chuyển
 * Hiển thị các phương thức vận chuyển có sẵn và giá cước tương ứng
 */
const ShippingMethodSelector = ({ selectedMethod, setSelectedMethod, subtotal }) => {
  // Danh sách phương thức vận chuyển
  const shippingMethods = [
    {
      id: 'standard',
      name: 'Giao hàng tiêu chuẩn',
      description: 'Giao hàng trong 3-5 ngày làm việc',
      price: subtotal > 500000 ? 0 : 30000,
      isDefault: true,
      estimatedDelivery: '3-5 ngày'
    },
    {
      id: 'express',
      name: 'Giao hàng nhanh',
      description: 'Giao hàng trong 1-2 ngày làm việc',
      price: 50000,
      isDefault: false,
      estimatedDelivery: '1-2 ngày'
    },
    {
      id: 'same_day',
      name: 'Giao hàng trong ngày',
      description: 'Chỉ áp dụng với đơn hàng trước 12h trưa và trong khu vực nội thành',
      price: 100000,
      isDefault: false,
      estimatedDelivery: 'Trong ngày'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Phương thức vận chuyển</h2>
      
      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <div 
            key={method.id}
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === method.id 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`shipping-${method.id}`}
                  name="shippingMethod"
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor={`shipping-${method.id}`} className="ml-3 cursor-pointer">
                  <span className="font-medium">{method.name}</span>
                  <span className="block text-sm text-gray-600 mt-1">{method.description}</span>
                </label>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {method.price === 0 
                    ? 'Miễn phí' 
                    : `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(method.price)}`}
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  Dự kiến giao: {method.estimatedDelivery}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Miễn phí vận chuyển cho đơn hàng từ 500.000₫ với giao hàng tiêu chuẩn
        </p>
        <p className="flex items-center mt-2">
          <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Thời gian giao hàng có thể thay đổi tùy thuộc vào khu vực và tình trạng đơn hàng
        </p>
      </div>
    </div>
  );
};

export default ShippingMethodSelector;