import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CategoryNav from '../components/CategoryNav';
import { products as allProducts } from '../data/products';
import SkeletonProductCard from '../components/SkeletonProductCard';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (activeCategory === 'all') {
        setFilteredProducts(allProducts);
      } else {
        setFilteredProducts(allProducts.filter(p => p.category === activeCategory));
      }
      setLoading(false);
    }, 500); // Shorter delay for better UX
    return () => clearTimeout(timer);
  }, [activeCategory]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[450px] md:h-[75vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-red-500/70 to-secondary/60 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 shadow-text-lg animate-fade-in-down"
                style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              Nâng Tầm Cuộc Sống Hiện Đại
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up"
               style={{animationDelay: '0.3s', textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>
              Khám phá bộ sưu tập thiết bị gia đình thông minh với giá ưu đãi đặc biệt!
            </p>
            <Link 
              to="/products"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3.5 rounded-full font-semibold text-lg shadow-xl transform transition hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50 animate-fade-in-up"
              style={{animationDelay: '0.6s'}}
            >
              Mua Ngay <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
        {/* Subtle overlay/pattern if desired */}
        {/* <div className="absolute inset-0 bg-black/10"></div> */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Product Grid Section */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-800 dark:text-white">
            {activeCategory === 'all' ? 'Sản Phẩm Nổi Bật' : `Sản Phẩm ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
          </h3>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => <SkeletonProductCard key={i} />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Không tìm thấy sản phẩm nào trong danh mục này.</p>
          )}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-800 dark:text-white">Đánh Giá Từ Khách Hàng</h3>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Featured Collection/Promo Section (Example) */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ưu Đãi Đặc Biệt Mùa Hè</h3>
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto">Giảm giá tới 30% cho các sản phẩm quạt và máy lọc không khí.</p>
          <Link 
            to="/products?category=fan&sale=true" // Example of more specific linking
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg transform transition hover:scale-105"
          >
            Xem Ngay
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;

