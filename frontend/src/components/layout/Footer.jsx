import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component Footer - Hiển thị chân trang của ứng dụng
 * Bao gồm thông tin liên hệ, đường dẫn nhanh và thông tin pháp lý
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Yapee Vietnam</h3>
            <p className="mb-2">Thiết bị gia dụng thông minh hàng đầu Việt Nam</p>
            <address className="not-italic">
              <p className="flex items-center mb-2">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                123 Nguyễn Huệ, Quận 1, TP.HCM
              </p>
              <p className="flex items-center mb-2">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1900 1234
              </p>
              <p className="flex items-center mb-2">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@yapee.vn
              </p>
            </address>
          </div>

          {/* Danh mục sản phẩm */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=tv" className="hover:text-amber-400 transition-colors">
                  Smart TV
                </Link>
              </li>
              <li>
                <Link to="/products?category=airconditioner" className="hover:text-amber-400 transition-colors">
                  Máy điều hòa thông minh
                </Link>
              </li>
              <li>
                <Link to="/products?category=refrigerator" className="hover:text-amber-400 transition-colors">
                  Tủ lạnh thông minh
                </Link>
              </li>
              <li>
                <Link to="/products?category=washingmachine" className="hover:text-amber-400 transition-colors">
                  Máy giặt thông minh
                </Link>
              </li>
              <li>
                <Link to="/products?category=lighting" className="hover:text-amber-400 transition-colors">
                  Hệ thống chiếu sáng
                </Link>
              </li>
              <li>
                <Link to="/products?category=security" className="hover:text-amber-400 transition-colors">
                  Thiết bị an ninh
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/support/delivery" className="hover:text-amber-400 transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/support/return" className="hover:text-amber-400 transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/support/warranty" className="hover:text-amber-400 transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="/support/payment" className="hover:text-amber-400 transition-colors">
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link to="/support/faq" className="hover:text-amber-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Đăng ký nhận tin */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Đăng ký nhận tin</h3>
            <p className="mb-4">Nhận thông tin về sản phẩm mới và khuyến mãi</p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-4 py-2 w-full text-gray-800 border-none rounded-l focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-r transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            </form>
            <h3 className="text-lg font-semibold mb-2 text-amber-400">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-400 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-400 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-400 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.214c0 2.717-.012 3.056-.06 4.122-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.214c-2.717 0-3.056-.012-4.122-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-400 transition-colors"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Chứng nhận và thanh toán */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2 text-amber-400">Chứng nhận</h4>
              <div className="flex space-x-4">
                <img src="/images/cert1.png" alt="Chứng nhận Bộ Công Thương" className="h-10" />
                <img src="/images/cert2.png" alt="Chứng nhận an toàn" className="h-10" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-amber-400">Phương thức thanh toán</h4>
              <div className="flex space-x-4">
                <img src="/images/payment1.png" alt="Visa" className="h-8" />
                <img src="/images/payment2.png" alt="Mastercard" className="h-8" />
                <img src="/images/payment3.png" alt="MoMo" className="h-8" />
                <img src="/images/payment4.png" alt="ZaloPay" className="h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm">
          <p>© {currentYear} Yapee Vietnam. Tất cả các quyền được bảo lưu.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/policy/privacy" className="hover:text-amber-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/policy/terms" className="hover:text-amber-400 transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/sitemap" className="hover:text-amber-400 transition-colors">
              Sơ đồ trang
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;