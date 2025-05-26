import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';

/**
 * Component hiển thị kết quả tìm kiếm sản phẩm
 * Có thể hiển thị dạng lưới hoặc danh sách
 */
const SearchResults = ({ 
  products, 
  loading, 
  viewMode, 
  searchQuery, 
  totalResults, 
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Hiển thị skeleton khi đang tải
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded h-48 w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Hiển thị khi không có kết quả
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="text-xl font-semibold mt-4">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-600 mt-2">
          {searchQuery 
            ? `Không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchQuery}"`
            : 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn'}
        </p>
        <div className="mt-6">
          <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Hiển thị kết quả dạng lưới (mặc định)
  if (viewMode === 'grid') {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-l-md border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Hiển thị nút trang hiện tại, 2 trang trước và 2 trang sau
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 border-t border-b ${
                        currentPage === page
                          ? 'bg-amber-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span
                      key={page}
                      className="px-3 py-1 border-t border-b bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-r-md border ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
        
        {/* Tổng số kết quả */}
        <div className="text-sm text-gray-500 text-center mt-4">
          Hiển thị {products.length} trên tổng số {totalResults} sản phẩm
        </div>
      </div>
    );
  }

  // Hiển thị kết quả dạng danh sách
  return (
    <div>
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 h-48 flex-shrink-0">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image_url || '/images/product-placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
              <div className="p-4 flex-grow">
                <Link to={`/products/${product.id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-amber-600">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < (product.rating || 0) ? 'text-amber-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-600 text-sm ml-1">
                    ({product.review_count || 0} đánh giá)
                  </span>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                {product.stock_status === 'in_stock' ? (
                  <p className="text-green-600 text-sm mt-2">Còn hàng</p>
                ) : (
                  <p className="text-red-600 text-sm mt-2">Hết hàng</p>
                )}
              </div>
              <div className="p-4 md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200">
                <div>
                  {product.discount_price ? (
                    <>
                      <div className="text-xl font-bold text-amber-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xl font-bold text-amber-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    to={`/products/${product.id}`}
                    className="block w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-center rounded-md font-medium"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Hiển thị nút trang hiện tại, 2 trang trước và 2 trang sau
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === page
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={page}
                    className="px-3 py-1 border-t border-b bg-white text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
      
      {/* Tổng số kết quả */}
      <div className="text-sm text-gray-500 text-center mt-4">
        Hiển thị {products.length} trên tổng số {totalResults} sản phẩm
      </div>
    </div>
  );
};

export default SearchResults;