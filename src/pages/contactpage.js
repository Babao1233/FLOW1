import React from 'react';

// Basic placeholder component
const ContactPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-secondary mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn lòng lắng nghe bạn. Hãy gửi thắc mắc hoặc góp ý cho Yapee.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Gửi Tin Nhắn</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Họ Tên</label>
                <input type="text" id="name" name="name" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                <input type="email" id="email" name="email" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Chủ Đề</label>
                <input type="text" id="subject" name="subject" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nội Dung</label>
                <textarea id="message" name="message" rows="5" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-600 dark:text-white" required></textarea>
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow-md"
                >
                  Gửi Tin Nhắn
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-xl">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Thông Tin Liên Hệ</h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt fa-fw w-6 mt-1 text-primary dark:text-secondary"></i>
                  <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone-alt fa-fw w-6 text-primary dark:text-secondary"></i>
                  <a href="tel:+84123456789" className="hover:text-primary dark:hover:text-secondary transition">(+84) 123 456 789</a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope fa-fw w-6 text-primary dark:text-secondary"></i>
                  <a href="mailto:support@yapee.com.vn" className="hover:text-primary dark:hover:text-secondary transition">support@yapee.com.vn</a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock fa-fw w-6 text-primary dark:text-secondary"></i>
                  <span>Thứ 2 - Thứ 7: 9:00 - 18:00</span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-xl h-64 md:h-auto"> {/* Map placeholder */}
               <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Vị Trí Trên Bản Đồ</h2>
               <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                 <p className="text-gray-500 dark:text-gray-400">(Google Maps Placeholder)</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

