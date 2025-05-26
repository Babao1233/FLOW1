import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-7 h-7 text-primary mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 <path d="M2 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Yapee
            </h4>
            <p className="text-gray-400 mb-4 text-sm">Nâng tầm cuộc sống hiện đại với những thiết bị thông minh hàng đầu.</p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-primary transition"><i className="fab fa-facebook-f fa-lg"></i></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-primary transition"><i className="fab fa-instagram fa-lg"></i></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-primary transition"><i className="fab fa-twitter fa-lg"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-primary transition">Trang Chủ</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-primary transition">Sản Phẩm</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition">Về Chúng Tôi</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-primary transition">Điều Khoản Dịch Vụ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-primary transition">Liên Hệ</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition">Chính sách bảo hành</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition">Hướng dẫn sử dụng</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Nhận Tin Mới</h4>
            <p className="text-gray-400 mb-4 text-sm">Đăng ký để nhận ưu đãi đặc biệt và cập nhật sản phẩm mới nhất.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="px-3 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-r-md text-sm font-semibold transition">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Yapee Vietnam. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

