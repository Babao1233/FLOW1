import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Component ProductCategories - Hiển thị các danh mục sản phẩm chính trên trang chủ
 */
const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu mẫu cho danh mục (sẽ được thay thế bằng dữ liệu từ API)
  const categoryImages = {
    'TV': '/images/categories/tv.jpg',
    'Máy lạnh': '/images/categories/airconditioner.jpg',
    'Tủ lạnh': '/images/categories/refrigerator.jpg',
    'Máy giặt': '/images/categories/washingmachine.jpg',
    'Đèn thông minh': '/images/categories/lighting.jpg',
    'Camera an ninh': '/images/categories/security.jpg',
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Không thể tải danh mục sản phẩm');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Lỗi khi tải danh mục sản phẩm:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div className="text-center text-red-500">
            <p>Có lỗi xảy ra: {error}</p>
            <p>Vui lòng thử lại sau</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p>Không có danh mục sản phẩm nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category} 
                to={`/products?category=${category}`} 
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg h-48">
                  {/* Hình ảnh danh mục */}
                  <img 
                    src={categoryImages[category] || '/images/categories/default.jpg'} 
                    alt={category}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <h3 className="text-white font-semibold text-lg">{category}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCategories;