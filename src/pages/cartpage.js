import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useContext(CartContext);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <i className="fas fa-shopping-cart fa-4x text-gray-400 dark:text-gray-500 mb-6"></i>
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hãy khám phá thêm các sản phẩm tuyệt vời của chúng tôi!</p>
        <Link 
          to="/" 
          className="bg-primary hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition text-lg"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white">Giỏ Hàng ({cartCount} sản phẩm)</h1>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b dark:border-gray-600 pb-6 last:border-b-0 last:pb-0">
                <Link to={`/product/${item.id}`} className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-lg shadow" 
                    loading="lazy"
                  />
                </Link>
                <div className="flex-grow text-center sm:text-left">
                  <Link to={`/product/${item.id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white hover:text-primary dark:hover:text-secondary transition">{item.name}</h2>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Giá: ${item.salePrice}</p>
                </div>
                <div className="flex items-center space-x-3 sm:ml-auto">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-md disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-10 text-center py-1.5 bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-white"
                      aria-label="Item quantity"
                    />
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                       disabled={item.quantity >= (item.stock || 10)} // Assuming max stock 10 if not defined
                      className="px-2.5 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-md disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  <p className="text-md font-semibold w-20 text-right text-gray-800 dark:text-white">${(item.salePrice * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition p-1"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
             {cartItems.length > 0 && (
              <div className="mt-6 text-right">
                <button 
                  onClick={clearCart}
                  className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition underline"
                >
                  Xóa tất cả giỏ hàng
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-6 sticky top-24"> {/* top-24 to account for header and category nav (if any) */}
            <h2 className="text-2xl font-semibold border-b dark:border-gray-600 pb-4 text-gray-800 dark:text-white">Tổng Quan Đơn Hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Tạm tính ({cartCount} sản phẩm):</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">Miễn phí</span> {/* Or calculate shipping */}
              </div>
              {/* Coupon Code Input (Optional) */}
              <form className="flex pt-2">
                <input type="text" placeholder="Mã giảm giá" className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-600 dark:text-white text-sm" />
                <button type="submit" className="bg-gray-200 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-400 text-gray-700 dark:text-white px-4 py-2 rounded-r-md text-sm font-medium transition">Áp dụng</button>
              </form>
            </div>
            <div className="border-t dark:border-gray-600 pt-6 space-y-4">
              <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
                <span>Tổng cộng:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <Link 
                to="/checkout"
                className="w-full block text-center bg-primary hover:bg-red-600 dark:bg-secondary dark:hover:bg-orange-600 text-white px-6 py-3.5 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
              >
                Tiến Hành Thanh Toán
              </Link>
              <Link 
                to="/"
                className="w-full block text-center text-primary dark:text-secondary hover:underline mt-4 font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

