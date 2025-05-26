import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import ShippingMethodSelector from '../components/checkout/ShippingMethodSelector';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import OrderSummary from '../components/checkout/OrderSummary';

/**
 * Trang thanh toán - Cho phép người dùng nhập thông tin giao hàng, chọn phương thức thanh toán và hoàn tất đơn hàng
 */
const CheckoutPage = () => {
  const navigate = useNavigate();

  // State quản lý giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // State quản lý phương thức thanh toán và vận chuyển
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // State quản lý form thông tin giao hàng
  const [addressForm, setAddressForm] = useState({
    savedAddressId: 0,
    fullName: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    saveAddress: false
  });
  
  // State quản lý mã giảm giá
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // State quản lý lỗi form
  const [errors, setErrors] = useState({});
  
  // State quản lý quá trình đặt hàng
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // State quản lý các địa chỉ đã lưu (nếu người dùng đã đăng nhập)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Tải dữ liệu giỏ hàng từ localStorage
  useEffect(() => {
    const loadCartAndAddresses = async () => {
      try {
        // Kiểm tra đăng nhập
        const checkLoginStatus = async () => {
          try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();
            setIsLoggedIn(data.loggedIn);
            return data.loggedIn;
          } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
            return false;
          }
        };
        
        const loggedIn = await checkLoginStatus();
        
        // Nếu đã đăng nhập, tải địa chỉ đã lưu
        if (loggedIn) {
          try {
            const addressResponse = await fetch('/api/user/addresses');
            if (addressResponse.ok) {
              const addressData = await addressResponse.json();
              setSavedAddresses(addressData);
            }
          } catch (error) {
            console.error('Lỗi khi tải địa chỉ đã lưu:', error);
          }
        }
        
        // Tải thông tin checkout đã lưu trong localStorage
        const checkoutInfo = JSON.parse(localStorage.getItem('checkout_info') || 'null');
        
        if (checkoutInfo) {
          setCartItems(checkoutInfo.items || []);
          setSubtotal(checkoutInfo.subtotal || 0);
          setShipping(checkoutInfo.shipping || 0);
          setDiscount(checkoutInfo.discount || 0);
        } else {
          // Nếu không có thông tin checkout, tải từ giỏ hàng
          const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
          
          if (storedCart.length === 0) {
            // Chuyển hướng về trang giỏ hàng nếu giỏ trống
            navigate('/cart');
            return;
          }
          
          // Tải thông tin chi tiết sản phẩm từ API
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
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu checkout:', error);
      }
    };
    
    loadCartAndAddresses();
  }, [navigate]);

  // Xử lý khi thay đổi thông tin form
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
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

  // Chọn địa chỉ đã lưu
  const setSavedAddressId = (addressId) => {
    setAddressForm({
      ...addressForm,
      savedAddressId: addressId
    });
    
    // Nếu chọn địa chỉ đã lưu, điền thông tin vào form
    if (addressId > 0) {
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setAddressForm({
          ...addressForm,
          savedAddressId: addressId,
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          email: selectedAddress.email || '',
          address: selectedAddress.address,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward || ''
        });
      }
    }
  };

  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    // Bỏ qua xác thực nếu đã chọn địa chỉ đã lưu
    if (addressForm.savedAddressId === 0) {
      if (!addressForm.fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ tên người nhận';
      }
      
      if (!addressForm.phone.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      } else if (!/^[0-9]{10,11}$/.test(addressForm.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
      
      if (addressForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email)) {
        newErrors.email = 'Địa chỉ email không hợp lệ';
      }
      
      if (!addressForm.address.trim()) {
        newErrors.address = 'Vui lòng nhập địa chỉ';
      }
      
      if (!addressForm.province) {
        newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
      }
      
      if (!addressForm.district.trim()) {
        newErrors.district = 'Vui lòng nhập quận/huyện';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi áp dụng mã giảm giá
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
        discountValue = Math.round(subtotal * 0.1); // Giảm 10%
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

  // Xử lý khi đặt hàng
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      // Cuộn đến phần lỗi đầu tiên
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setIsSubmitting(true);
    setOrderError('');
    
    try {
      // Tạo dữ liệu đơn hàng
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.discount_price || item.price
        })),
        shippingAddress: {
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          email: addressForm.email,
          address: addressForm.address,
          province: addressForm.province,
          district: addressForm.district,
          ward: addressForm.ward
        },
        shippingMethod,
        paymentMethod,
        subtotal,
        shippingCost: shipping,
        discount,
        total: subtotal + shipping - discount
      };
      
      // Gửi dữ liệu đến API để tạo đơn hàng
      // Giả lập API để demo
      await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập độ trễ API
      
      // Giả lập thành công
      console.log('Đơn hàng đã được tạo:', orderData);
      
      // Xóa giỏ hàng và thông tin checkout sau khi đặt hàng thành công
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_info');
      
      // Lưu ID đơn hàng vào localStorage để hiển thị trang xác nhận
      localStorage.setItem('latest_order', JSON.stringify({
        orderId: 'ORD' + Date.now(),
        total: orderData.total,
        paymentMethod,
        date: new Date().toISOString()
      }));
      
      // Chuyển hướng đến trang xác nhận đơn hàng
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 1000);
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      setOrderError('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính tổng tiền
  const total = subtotal + shipping - discount;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      
      {/* Hiển thị thông báo lỗi đặt hàng */}
      {orderError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {orderError}
        </div>
      )}
      
      {/* Hiển thị thông báo đặt hàng thành công */}
      {orderSuccess ? (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Đặt hàng thành công! Đang chuyển hướng đến trang xác nhận đơn hàng...
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Phần trái: Form thanh toán */}
          <div className="lg:w-2/3 space-y-6">
            {/* Form địa chỉ giao hàng */}
            <ShippingAddressForm
              formData={addressForm}
              errors={errors}
              handleChange={handleFormChange}
              savedAddresses={savedAddresses}
              setSavedAddressId={setSavedAddressId}
            />
            
            {/* Phương thức vận chuyển */}
            <ShippingMethodSelector
              selectedMethod={shippingMethod}
              setSelectedMethod={setShippingMethod}
              subtotal={subtotal}
            />
            
            {/* Phương thức thanh toán */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              setSelectedMethod={setPaymentMethod}
            />
            
            {/* Nút đặt hàng cho phiên bản mobile */}
            <div className="lg:hidden">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Bằng việc đặt hàng, bạn đồng ý với <a href="/policy/terms" className="text-amber-600 hover:text-amber-700">Điều khoản dịch vụ</a> của chúng tôi
              </p>
            </div>
          </div>
          
          {/* Phần phải: Tổng quan đơn hàng */}
          <div className="lg:w-1/3">
            <div className="sticky top-20">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                discount={discount}
                total={total}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                applyCoupon={applyCoupon}
                isApplyingCoupon={isApplyingCoupon}
                couponError={couponError}
                couponSuccess={couponSuccess}
              />
              
              {/* Nút đặt hàng cho phiên bản desktop */}
              <div className="hidden lg:block">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Bằng việc đặt hàng, bạn đồng ý với <a href="/policy/terms" className="text-amber-600 hover:text-amber-700">Điều khoản dịch vụ</a> của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;