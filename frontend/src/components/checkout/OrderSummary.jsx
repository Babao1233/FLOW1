import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component hiển thị tổng quan đơn hàng trong quá trình thanh toán
 * Bao gồm danh sách sản phẩm, giá, giảm giá và tổng tiền
 */
const OrderSummary = ({ 
  cartItems, 
  subtotal, 
  shipping, 
  discount, 
  total, 
  couponCode, 
  setCouponCode, 
  applyCoupon, 
  isApplyingCoupon, 
  couponError, 
  couponSuccess 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Tổng quan đơn hàng</h2>
      
      {/* Danh sách sản phẩm */}
      <div className="max-h-80 overflow-y-auto mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center py-3 border-b border-gray-200 last:border-0">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={item.image_url || '/images/product-placeholder.jpg'}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-800">
                <Link to={`/products/${item.id}`} className="hover:text-amber-600">
                  {item.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-600 mt-1">Số lượng: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice)}
              </p>
              {item.discount_price && (
                <p className="text-xs text-gray-500 line-through">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Mã giảm giá */}
      <div className="mb-4 pt-2 border-t border-gray-200">
        <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700 mb-1">
          Mã giảm giá
        </label>
        <div className="flex">
          <input
            type="text"
            id="coupon-code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300 text-sm"
            placeholder="Nhập mã giảm giá"
          />
          <button
            onClick={applyCoupon}
            disabled={isApplyingCoupon}
            className={`px-3 py-2 rounded-r-md font-medium text-white text-sm ${
              isApplyingCoupon
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
          </button>
        </div>
        {couponError && (
          <p className="text-red-600 text-xs mt-1">{couponError}</p>
        )}
        {couponSuccess && (
          <p className="text-green-600 text-xs mt-1">{couponSuccess}</p>
        )}
      </div>
      
      {/* Tổng tiền */}
      <div className="space-y-2 py-4 border-t border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tạm tính</span>
          <span className="text-gray-800 font-medium">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span className="text-gray-800 font-medium">
            {shipping === 0 
              ? 'Miễn phí' 
              : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá</span>
            <span>
              -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}
            </span>
          </div>
        )}
      </div>
      
      {/* Tổng cộng */}
      <div className="flex justify-between font-semibold text-lg mt-4">
        <span>Tổng cộng</span>
        <span className="text-amber-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
        </span>
      </div>
      
      {/* Thông tin thêm */}
      <div className="mt-4 text-xs text-gray-600">
        <p>* Đã bao gồm VAT (nếu có)</p>
        <p className="mt-1">* Bằng việc đặt hàng, bạn đồng ý với <Link to="/policy/terms" className="text-amber-600 hover:text-amber-700">Điều khoản dịch vụ</Link> của chúng tôi</p>
      </div>
    </div>
  );
};

export default OrderSummary;