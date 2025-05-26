import React from 'react';
import HeroBanner from '../components/home/HeroBanner';
import FeaturedProducts from '../components/home/FeaturedProducts';
import ProductCategories from '../components/home/ProductCategories';

/**
 * Trang chủ - Hiển thị nội dung chính của trang web
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Banner chính */}
      <HeroBanner />
      
      {/* Danh mục sản phẩm */}
      <ProductCategories />
      
      {/* Sản phẩm nổi bật */}
      <FeaturedProducts />
      
      {/* Tính năng nổi bật */}
      <section className="py-12 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn Yapee Vietnam?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tính năng 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sản phẩm chính hãng</h3>
              <p className="text-gray-600">
                Yapee Vietnam cam kết cung cấp các sản phẩm chính hãng 100%, với đầy đủ giấy tờ bảo hành từ nhà sản xuất.
              </p>
            </div>
            
            {/* Tính năng 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-600">
                Dịch vụ giao hàng nhanh trong vòng 24h đối với các khu vực nội thành Hà Nội và TP.HCM, 3-5 ngày cho các tỉnh thành khác.
              </p>
            </div>
            
            {/* Tính năng 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ chuyên nghiệp</h3>
              <p className="text-gray-600">
                Đội ngũ tư vấn viên chuyên nghiệp, sẵn sàng hỗ trợ khách hàng 24/7 qua hotline, email và chat trực tuyến.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Khách hàng đánh giá */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Khách hàng nói gì về chúng tôi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Đánh giá 1 */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Tôi đã mua Smart TV từ Yapee Vietnam và rất hài lòng với chất lượng sản phẩm cũng như dịch vụ giao hàng. Nhân viên tư vấn rất nhiệt tình và chuyên nghiệp."
              </p>
              <div className="flex items-center">
                <img src="/images/avatars/customer1.jpg" alt="Nguyễn Văn A" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h4 className="font-semibold">Nguyễn Văn A</h4>
                  <p className="text-sm text-gray-500">Hà Nội</p>
                </div>
              </div>
            </div>
            
            {/* Đánh giá 2 */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Tủ lạnh thông minh của Yapee Vietnam giúp tôi tiết kiệm được rất nhiều điện năng. Ứng dụng điều khiển từ xa rất dễ sử dụng và tiện lợi. Chắc chắn sẽ tiếp tục mua sắm tại đây."
              </p>
              <div className="flex items-center">
                <img src="/images/avatars/customer2.jpg" alt="Trần Thị B" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h4 className="font-semibold">Trần Thị B</h4>
                  <p className="text-sm text-gray-500">TP.HCM</p>
                </div>
              </div>
            </div>
            
            {/* Đánh giá 3 */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Chính sách bảo hành và dịch vụ sau bán hàng của Yapee Vietnam rất tốt. Khi máy giặt của tôi gặp vấn đề, họ đã cử kỹ thuật viên đến kiểm tra và sửa chữa trong vòng 24 giờ."
              </p>
              <div className="flex items-center">
                <img src="/images/avatars/customer3.jpg" alt="Lê Văn C" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h4 className="font-semibold">Lê Văn C</h4>
                  <p className="text-sm text-gray-500">Đà Nẵng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Đăng ký nhận tin */}
      <section className="py-12 bg-amber-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold mb-2">Đăng ký nhận thông tin</h2>
              <p>Nhận thông báo về sản phẩm mới và ưu đãi đặc biệt từ Yapee Vietnam</p>
            </div>
            <div className="w-full md:w-1/2">
              <form className="flex flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  className="flex-grow px-4 py-3 rounded-l focus:outline-none text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-r font-medium transition-colors sm:mt-0 mt-2"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;