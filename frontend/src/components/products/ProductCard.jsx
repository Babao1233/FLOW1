import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component ProductCard - Hiển thị thông tin sản phẩm dạng card
 * @param {Object} props.product - Thông tin sản phẩm
 */
const ProductCard = ({ product }) => {
  const {
    id,
    name,
    price,
    description,
    image_url,
    discount_price,
    stock,
    rating
  } = product;

  // Tính phần trăm giảm giá nếu có
  const discountPercentage = discount_price 
    ? Math.round(((price - discount_price) / price) * 100) 
    : 0;

  // Kiểm tra hết hàng
  const isOutOfStock = stock === 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Badge giảm giá */}
      {discount_price > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}
      
      {/* Hình ảnh sản phẩm */}
      <Link to={`/products/${id}`} className="block relative overflow-hidden h-48">
        <img
          src={image_url || '/images/product-placeholder.jpg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Overlay hết hàng */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold">Hết hàng</span>
          </div>
        )}
      </Link>
      
      {/* Thông tin sản phẩm */}
      <div className="p-4">
        <Link to={`/products/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        {/* Đánh giá */}
        {rating && (
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-amber-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-600 text-sm ml-1">{rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Mô tả ngắn */}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {description}
        </p>
        
        {/* Giá */}
        <div className="mt-3 flex items-center">
          {discount_price ? (
            <>
              <span className="text-xl font-bold text-amber-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount_price)}
              </span>
              <span className="text-sm text-gray-500 line-through ml-2">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-amber-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
          )}
        </div>
        
        {/* Nút thêm vào giỏ hàng */}
        <div className="mt-4">
          <button
            disabled={isOutOfStock}
            className={`w-full py-2 rounded-md font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;