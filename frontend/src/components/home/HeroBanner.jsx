import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component HeroBanner - Hiển thị banner chính cho trang chủ
 */
const HeroBanner = () => {
  return (
    <section className="relative bg-gray-900 text-white">
      {/* Overlay hình ảnh nền */}
      <div className="absolute inset-0 bg-center bg-cover bg-no-repeat" 
           style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      
      {/* Nội dung banner */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Khám phá thế giới <span className="text-amber-500">gia dụng thông minh</span>
          </h1>
          <p className="text-xl mb-8">
            Yapee Vietnam mang đến các sản phẩm gia dụng thông minh hàng đầu, giúp nâng cao chất lượng cuộc sống với công nghệ hiện đại.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/products" className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-md transition-colors text-center">
              Khám phá sản phẩm
            </Link>
            <Link to="/about" className="bg-transparent hover:bg-white/10 border border-white text-white font-medium py-3 px-6 rounded-md transition-colors text-center">
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>
      
      {/* Các nhãn hiệu đối tác */}
      <div className="bg-white/10 backdrop-blur-sm py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <img src="/images/brand1.png" alt="Brand 1" className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/brand2.png" alt="Brand 2" className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/brand3.png" alt="Brand 3" className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/brand4.png" alt="Brand 4" className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/images/brand5.png" alt="Brand 5" className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;