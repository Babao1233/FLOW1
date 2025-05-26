import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Trang giỏ hàng - Hiển thị và quản lý sản phẩm trong giỏ hàng
 */
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const navigate = useNavigate();

  // Tải dữ liệu giỏ hàng từ localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (storedCart.length === 0) {
          setCartItems([]);
          setSubtotal(0);
          setLoading(false);
          return;
        }
        
        // Tải thông tin chi tiết sản phẩm từ API để đảm bảo dữ liệu cập nhật
        const cartWithDetails = await Promise.all(
          storedCart.map(async (item) => {
            try {
              const response = await fetch(`/api/products/${item.id}`);
              
              if (!response.ok) {
                throw new Error(`Không thể tải thông tin sản phẩm ID ${item.id}`);
              }
              
              const productData = await response.json();
              
              // Tính giá thực tế (có thể là giá khuyến mãi)
              const actualPrice = productData.discount_price || productData.price;
              
              return {
                ...productData,
                quantity: item.quantity,
                totalPrice: actualPrice * item.quantity
              };
            } catch (error) {
              console.error(`Lỗi khi tải sản phẩm ID ${item.id}:`, error);
              // Trả về dữ liệu từ localStorage nếu không tải được từ API
              return {
                ...item,
                totalPrice: item.price * item.quantity
              };
            }
          })
        );
        
        setCartItems(cartWithDetails);
        
        // Tính tổng giá trị đơn hàng
        const total = cartWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
        setSubtotal(total);
        
        // Tính phí vận chuyển (miễn phí nếu đơn hàng > 500.000 VND)
        setShipping(total > 500000 ? 0 : 30000);
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Giới hạn số lượng tối đa là 10
    if (newQuantity > 10) newQuantity = 10;
    
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        const actualPrice = item.discount_price || item.price;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: actualPrice * newQuantity
        };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    
    // Cập nhật localStorage
    const storageCart = updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(storageCart));
    
    // Cập nhật tổng tiền
    const total = updatedCart.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(total);
    
    // Cập nhật phí vận chuyển
    setShipping(total > 500000 ? 0 : 30000);
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    
    // Cập nhật localStorage
    const storageCart = updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(storageCart));
    
    // Cập nhật tổng tiền
    const total = updatedCart.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(total);
    
    // Cập nhật phí vận chuyển
    setShipping(total > 500000 ? 0 : 30000);
  };

  // Xử lý mã giảm giá
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setCouponError('');
    setCouponSuccess('');
    setIsApplyingCoupon(true);
    
    try {
      // Gửi mã giảm giá đến API để xác thực
      // Giả lập API bằng cách kiểm tra một số mã cứng
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập độ trễ API
      
      let discountValue = 0;
      if (couponCode.toUpperCase() === 'WELCOME10') {
        discountValue = subtotal * 0.1; // Giảm 10%
        setCouponSuccess('Áp dụng mã giảm giá thành công: Giảm 10%');
      } else if (couponCode.toUpperCase() === 'FREESHIP') {
        discountValue = shipping;
        setCouponSuccess('Áp dụng mã giảm giá thành công: Miễn phí vận chuyển');
      } else if (couponCode.toUpperCase() === 'YAPEE50K') {
        discountValue = 50000;
        setCouponSuccess('Áp dụng mã giảm giá thành công: Giảm 50.000₫');
      } else {
        setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
      
      setDiscount(discountValue);
      
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      setCouponError('Đã xảy ra lỗi khi áp dụng mã giảm giá. Vui lòng thử lại.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Xử lý khi tiến hành thanh toán
  const handleCheckout = () => {
    // Lưu thông tin giỏ hàng để sử dụng ở trang thanh toán
    localStorage.setItem('checkout_info', JSON.stringify({
      items: cartItems,
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
    }));
    
    // Chuyển hướng đến trang thanh toán
    navigate('/checkout');
  };

  // Tính tổng tiền
  const total = subtotal + shipping - discount;

  // Hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Hiển thị khi giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h2 className="text-xl font-semibold mt-4">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-600 mt-2">Khám phá các sản phẩm của chúng tôi và thêm vào giỏ hàng ngay!</p>
          <Link to="/products" className="mt-6 inline-block bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Danh sách sản phẩm */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img 
                            className="h-16 w-16 object-cover rounded" 
                            src={item.image_url || '/images/product-placeholder.jpg'} 
                            alt={item.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <Link to={`/products/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-amber-600">
                            {item.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.discount_price ? (
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discount_price)}
                          </span>
                          <span className="block text-sm text-gray-500 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center border rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <Link to="/products" className="flex items-center text-amber-600 hover:text-amber-700">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Tiếp tục mua sắm
            </Link>
            
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
                  setCartItems([]);
                  localStorage.setItem('cart', '[]');
                  setSubtotal(0);
                  setShipping(0);
                  setDiscount(0);
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
        
        {/* Tổng giỏ hàng */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tổng đơn hàng</h2>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-gray-800 font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                </span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-gray-800 font-medium">
                  {shipping === 0 
                    ? 'Miễn phí' 
                    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá</span>
                  <span>
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold text-lg mt-4">
                <span>Tổng cộng</span>
                <span className="text-amber-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
              
              {/* Mã giảm giá */}
              <div className="mt-6">
                <label htmlFor="coupon" className="block text-gray-700 font-medium mb-2">
                  Mã giảm giá
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300"
                    placeholder="Nhập mã giảm giá"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon}
                    className={`px-4 py-2 rounded-r-md font-medium text-white ${
                      isApplyingCoupon
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-600 text-sm mt-1">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-green-600 text-sm mt-1">{couponSuccess}</p>
                )}
              </div>
              
              {/* Thông tin thêm */}
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  * Miễn phí vận chuyển cho đơn hàng từ 500.000₫
                </p>
                <p className="mt-1">
                  * Thời gian giao hàng: 2-3 ngày làm việc
                </p>
              </div>
              
              {/* Nút thanh toán */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md mt-6"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;