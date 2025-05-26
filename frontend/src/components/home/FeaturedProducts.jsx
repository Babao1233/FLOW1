import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';

/**
 * Component FeaturedProducts - Hiển thị các sản phẩm nổi bật trên trang chủ
 */
const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/featured');
        
        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm nổi bật');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm nổi bật:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-lg bg-gray-200 h-80 w-60"></div>
              <div className="rounded-lg bg-gray-200 h-80 w-60 hidden md:block"></div>
              <div className="rounded-lg bg-gray-200 h-80 w-60 hidden lg:block"></div>
              <div className="rounded-lg bg-gray-200 h-80 w-60 hidden xl:block"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
          <div className="text-center text-red-500">
            <p>Có lỗi xảy ra: {error}</p>
            <p>Vui lòng thử lại sau</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
          <Link 
            to="/products" 
            className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
          >
            Xem tất cả
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <p>Không có sản phẩm nổi bật nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;