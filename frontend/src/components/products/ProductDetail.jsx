import React, { useState } from 'react';

/**
 * Component hiển thị chi tiết sản phẩm với hình ảnh, giá, mô tả và tùy chọn mua hàng
 */
const ProductDetail = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };
  
  // Tăng số lượng
  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  
  // Giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      image_url: product.image_url,
      quantity
    });
  };
  
  // Tính phần trăm giảm giá
  const calculateDiscountPercentage = () => {
    if (product.discount_price && product.price) {
      const discount = ((product.price - product.discount_price) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Kiểm tra tình trạng kho hàng
  const getStockStatus = () => {
    if (!product.stock_status) return 'Liên hệ';
    
    if (product.stock_status === 'in_stock') {
      return product.stock_quantity > 10 
        ? 'Còn hàng' 
        : `Còn ${product.stock_quantity} sản phẩm`;
    } else if (product.stock_status === 'out_of_stock') {
      return 'Hết hàng';
    } else if (product.stock_status === 'pre_order') {
      return 'Đặt trước';
    }
    
    return 'Liên hệ';
  };
  
  // Xác định màu hiển thị tình trạng kho hàng
  const getStockStatusColor = () => {
    if (!product.stock_status) return 'text-gray-600';
    
    if (product.stock_status === 'in_stock') {
      return 'text-green-600';
    } else if (product.stock_status === 'out_of_stock') {
      return 'text-red-600';
    } else if (product.stock_status === 'pre_order') {
      return 'text-blue-600';
    }
    
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phần hình ảnh sản phẩm */}
        <div className="p-4">
          {/* Hình ảnh chính */}
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : product.image_url || '/images/product-placeholder.jpg'}
              alt={product.name}
              className="w-full h-96 object-contain"
            />
          </div>
          
          {/* Danh sách hình ảnh nhỏ */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border rounded-md overflow-hidden cursor-pointer ${
                    selectedImage === index ? 'border-amber-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Hình ${index + 1}`}
                    className="w-full h-16 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Phần thông tin sản phẩm */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          {/* Mã sản phẩm & Thương hiệu */}
          <div className="flex flex-wrap gap-x-6 text-sm text-gray-600 mb-4">
            {product.sku && (
              <p>Mã sản phẩm: <span className="font-medium">{product.sku}</span></p>
            )}
            {product.brand && (
              <p>Thương hiệu: <span className="font-medium">{product.brand}</span></p>
            )}
          </div>
          
          {/* Giá sản phẩm */}
          <div className="mb-6">
            {product.discount_price ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-amber-600 mr-3">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                  -{calculateDiscountPercentage()}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-amber-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
            )}
            
            {/* Tình trạng kho hàng */}
            <div className="mt-2">
              <span className="text-sm">
                Tình trạng: <span className={`font-medium ${getStockStatusColor()}`}>{getStockStatus()}</span>
              </span>
            </div>
          </div>
          
          {/* Mô tả ngắn */}
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Thêm vào giỏ hàng */}
          <div className="flex flex-col space-y-4">
            {/* Số lượng */}
            <div className="flex items-center">
              <label htmlFor="quantity" className="text-gray-700 mr-4">Số lượng:</label>
              <div className="flex border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Nút thêm vào giỏ và mua ngay */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_status === 'out_of_stock'}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  product.stock_status === 'out_of_stock'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm vào giỏ
                </span>
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  window.location.href = '/cart';
                }}
                disabled={product.stock_status === 'out_of_stock'}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  product.stock_status === 'out_of_stock'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                Mua ngay
              </button>
            </div>
          </div>
          
          {/* Chính sách bán hàng */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Giao hàng nhanh</p>
                <p className="text-xs text-gray-500">2-3 ngày làm việc</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Bảo hành chính hãng</p>
                <p className="text-xs text-gray-500">12 tháng tại trung tâm bảo hành</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Đổi trả miễn phí</p>
                <p className="text-xs text-gray-500">Trong vòng 7 ngày</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Thanh toán an toàn</p>
                <p className="text-xs text-gray-500">Nhiều phương thức thanh toán</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;