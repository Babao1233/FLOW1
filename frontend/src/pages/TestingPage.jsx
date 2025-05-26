import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrowserCompatibilityTester from '../components/test/BrowserCompatibilityTester';
import ApiIntegrationTester from '../components/test/ApiIntegrationTester';
import UserFeedbackCollector from '../components/feedback/UserFeedbackCollector';
import Button from '../components/ui/Button';
import '../styles/animations.css';

/**
 * Trang kiểm thử tích hợp
 * Kết hợp các công cụ kiểm tra tương thích, API và thu thập phản hồi
 */
const TestingPage = () => {
  const [activeTab, setActiveTab] = useState('browser');
  
  // Các tab kiểm thử
  const tabs = [
    { id: 'browser', label: 'Kiểm tra tương thích', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    )},
    { id: 'api', label: 'Kiểm tra API', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    )},
    { id: 'feedback', label: 'Thu thập phản hồi', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
      </svg>
    )}
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiểm thử tích hợp</h1>
          <p className="text-gray-600 mt-1">
            Kiểm tra tương thích, API và thu thập phản hồi người dùng
          </p>
        </div>
        <Link to="/">
          <Button
            variant="outline"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            }
          >
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Chọn tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4 px-4 py-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium flex items-center
                  ${activeTab === tab.id
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="animate-fadeIn">
        {activeTab === 'browser' && (
          <BrowserCompatibilityTester />
        )}
        
        {activeTab === 'api' && (
          <ApiIntegrationTester />
        )}
        
        {activeTab === 'feedback' && (
          <UserFeedbackCollector />
        )}
      </div>
      
      {/* Developer notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ghi chú cho nhà phát triển</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
          <li>Kiểm tra tương thích trình duyệt sẽ phát hiện vấn đề về UI/UX trên các thiết bị và trình duyệt khác nhau</li>
          <li>Kiểm tra tích hợp API giúp xác minh kết nối backend-frontend ổn định</li>
          <li>Thu thập phản hồi người dùng giúp phát triển sản phẩm theo hướng người dùng</li>
          <li>Tất cả dữ liệu kiểm tra được lưu tạm trong localStorage và có thể xuất báo cáo chi tiết</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">Phiên bản kiểm thử: 1.0.0</span>
          <span className="text-xs text-gray-500">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
};

export default TestingPage;
