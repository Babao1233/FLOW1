import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetail from '../components/products/ProductDetail';

/**
 * Trang chi tiết sản phẩm - Hiển thị thông tin chi tiết về một sản phẩm cụ thể
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch sản phẩm theo ID
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        
        const data = await response.json();
        setProduct(data);
        
        // Fetch các sản phẩm liên quan (cùng danh mục)
        if (data.category) {
          const relatedResponse = await fetch(`/api/products?category=${data.category}&limit=4`);
          
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Loại bỏ sản phẩm hiện tại khỏi danh sách liên quan
            const filteredProducts = relatedData.products.filter(p => p.id !== parseInt(id));
            setRelatedProducts(filteredProducts);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin sản phẩm:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Reset state khi ID thay đổi
    setProduct(null);
    setRelatedProducts([]);
    setError(null);
    setLoading(true);
    
    fetchProductData();
    
    // Cuộn lên đầu trang khi ID thay đổi
    window.scrollTo(0, 0);
  }, [id]);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (productWithQuantity) => {
    // Tạm thời lưu vào localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cartItems.findIndex(item => item.id === productWithQuantity.id);
    
    if (existingItemIndex >= 0) {
      // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
      cartItems[existingItemIndex].quantity += productWithQuantity.quantity;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      cartItems.push(productWithQuantity);
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Hiển thị thông báo đã thêm vào giỏ hàng
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4">
            <Link to="/products" className="text-amber-600 hover:text-amber-700">
              Quay lại danh sách sản phẩm
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-yellow-600">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <p className="mt-4">
            <Link to="/products" className="text-amber-600 hover:text-amber-700">
              Quay lại danh sách sản phẩm
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-amber-600">Trang chủ</Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link to="/products" className="text-gray-500 hover:text-amber-600">Sản phẩm</Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link to={`/products?category=${product.category}`} className="text-gray-500 hover:text-amber-600">{product.category}</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>
      
      {/* Chi tiết sản phẩm */}
      <ProductDetail product={product} onAddToCart={handleAddToCart} />
      
      {/* Tabs thông tin chi tiết */}
      <div className="mt-10">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-b-2 border-amber-500 text-amber-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mô tả chi tiết
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-amber-500 text-amber-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-amber-500 text-amber-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Đánh giá
            </button>
          </nav>
        </div>
        
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h3>
              {product.full_description ? (
                <div dangerouslySetInnerHTML={{ __html: product.full_description }} />
              ) : (
                <p>{product.description}</p>
              )}
              
              {/* Tính năng nổi bật */}
              {product.features && product.features.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold mt-6 mb-3">Tính năng nổi bật</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
              
              {product.specifications ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50 w-1/3">{key}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">Thông tin đang được cập nhật.</p>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Đánh giá từ khách hàng</h3>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-amber-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-700 font-medium">{review.username}</span>
                        <span className="ml-auto text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                  <button className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">
                    Viết đánh giá đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image_url || '/images/product-placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-amber-600 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-3">
                    {product.discount_price ? (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-amber-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-amber-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;