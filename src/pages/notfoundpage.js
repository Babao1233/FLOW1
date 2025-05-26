import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 bg-white dark:bg-gray-900">
      <i className="fas fa-exclamation-triangle fa-5x text-primary dark:text-secondary mb-6 animate-bounce"></i>
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Trang Không Tìm Thấy</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-md">
        Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể trang đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/" 
          className="bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition text-lg shadow-md hover:shadow-lg"
        >
          <i className="fas fa-home mr-2"></i> Về Trang Chủ
        </Link>
        <Link 
          to="/contact" 
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold transition text-lg shadow-md hover:shadow-lg"
        >
          <i className="fas fa-envelope mr-2"></i> Liên Hệ Hỗ Trợ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

