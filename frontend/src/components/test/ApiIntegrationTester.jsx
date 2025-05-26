import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';
import '../../styles/animations.css';

/**
 * Component kiểm tra tích hợp API
 * Thực hiện kiểm tra tự động các endpoint API để xác nhận tính ổn định của backend
 */
const ApiIntegrationTester = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [autoTest, setAutoTest] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Danh sách các API endpoint cần kiểm tra
  const apiEndpoints = [
    /* APIs AUTH */
    { 
      name: 'Kiểm tra trạng thái đăng nhập', 
      service: 'auth', 
      method: 'checkAuthStatus', 
      params: [], 
      expectedStatus: 200,
      validateResponse: (response) => {
        // Thành công nếu có trường authenticated và là boolean
        return response && typeof response.authenticated === 'boolean';
      }
    },
    /* APIs PROFILE */
    { 
      name: 'Lấy thông tin người dùng', 
      service: 'profile', 
      method: 'getProfile', 
      params: [], 
      expectedStatus: 200,
      validateResponse: (response) => {
        return response && response.id && response.username && response.email;
      }
    },
    { 
      name: 'Cập nhật thông tin người dùng - Kiểm tra validate', 
      service: 'profile', 
      method: 'updateProfile', 
      params: [{ full_name: '', phone: 'invalid' }], 
      expectedStatus: 400,
      expectError: true,
      validateResponse: (response, error) => {
        return error && (error.statusCode === 400 || error.status === 400);
      }
    },
    /* APIs ADDRESS */
    { 
      name: 'Lấy danh sách địa chỉ', 
      service: 'address', 
      method: 'getAddresses', 
      params: [], 
      expectedStatus: 200,
      validateResponse: (response) => {
        return Array.isArray(response);
      }
    },
    { 
      name: 'Lấy địa chỉ mặc định (hoặc null nếu chưa có)', 
      service: 'address', 
      method: 'getDefaultAddress', 
      params: [], 
      expectedStatus: 200,
      validateResponse: (response) => {
        // Có thể trả về null nếu chưa có địa chỉ mặc định
        return response === null || (response && typeof response.id !== 'undefined');
      }
    },
    { 
      name: 'Thêm địa chỉ mới - Kiểm tra validate', 
      service: 'address', 
      method: 'addAddress', 
      params: [{ full_name: '', address: '' }], 
      expectedStatus: 400,
      expectError: true,
      validateResponse: (response, error) => {
        return error && (error.statusCode === 400 || error.status === 400);
      }
    },
    /* APIs ORDER */
    { 
      name: 'Lấy danh sách đơn hàng', 
      service: 'order', 
      method: 'getOrders', 
      params: [{ page: 1, limit: 5 }], 
      expectedStatus: 200,
      validateResponse: (response) => {
        return response && Array.isArray(response.items) && typeof response.total === 'number';
      }
    },
    { 
      name: 'Lấy chi tiết đơn hàng không tồn tại (Kiểm tra xử lý lỗi)', 
      service: 'order', 
      method: 'getOrderById', 
      params: [{ id: 'non-existent-id' }], 
      expectedStatus: 404,
      expectError: true,
      validateResponse: (response, error) => {
        return error && (error.statusCode === 404 || error.status === 404);
      }
    },
    { 
      name: 'Hủy đơn hàng không tồn tại (Kiểm tra xử lý lỗi)', 
      service: 'order', 
      method: 'cancelOrder', 
      params: [{ id: 'non-existent-id', reason: 'Kiểm tra API' }], 
      expectedStatus: 404,
      expectError: true,
      validateResponse: (response, error) => {
        return error && (error.statusCode === 404 || error.status === 404);
      }
    },
    /* APIs FAVORITES */
    { 
      name: 'Lấy danh sách sản phẩm yêu thích', 
      service: 'favorites', 
      method: 'getFavorites', 
      params: [], 
      expectedStatus: 200,
      validateResponse: (response) => {
        return Array.isArray(response);
      }
    },
    { 
      name: 'Kiểm tra sản phẩm có trong danh sách yêu thích', 
      service: 'favorites', 
      method: 'checkFavorite', 
      params: [{ productId: 'test-product-id' }], 
      expectedStatus: 200,
      validateResponse: (response) => {
        return typeof response.isFavorite === 'boolean';
      }
    },
    /* APIs PAGINATION */
    { 
      name: 'Kiểm tra phân trang - Page không hợp lệ', 
      service: 'order', 
      method: 'getOrders', 
      params: [{ page: -1, limit: 5 }], 
      expectedStatus: 400,
      expectError: true,
      validateResponse: (response, error) => {
        return error && (error.statusCode === 400 || error.status === 400);
      }
    },
    /* APIs PERFORMANCE */
    { 
      name: 'Kiểm tra hiệu suất API - Tiết kiệm bandwidth', 
      service: 'profile', 
      method: 'getProfile', 
      params: [], 
      expectedStatus: 200,
      performanceTest: true,
      validateResponse: (response) => {
        // Kiểm tra kích thước dữ liệu phản hồi (kb)
        const responseSize = new Blob([JSON.stringify(response)]).size / 1024;
        return responseSize < 100; // Dưới 100kb là hợp lý
      }
    }
  ];
  
  // Chạy kiểm tra một API endpoint
  const testEndpoint = async (endpoint) => {
    try {
      const startTime = Date.now();
      let error = null;
      let data = null;
      
      try {
        // Gọi API tương ứng
        data = await accountService[endpoint.service][endpoint.method](...endpoint.params);
      } catch (err) {
        error = err;
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Kiểm tra kết quả
      let passed = false;
      
      if (endpoint.expectError) {
        // Nếu API được mong đợi trả về lỗi
        passed = endpoint.validateResponse(data, error);
      } else {
        // Nếu API được mong đợi trả về thành công
        passed = !error && endpoint.validateResponse(data);
      }
      
      return {
        name: endpoint.name,
        passed: passed,
        responseTime: responseTime,
        error: error ? error.message : null,
        statusCode: error ? error.statusCode : 200,
        data: data
      };
    } catch (err) {
      return {
        name: endpoint.name,
        passed: false,
        responseTime: 0,
        error: 'Lỗi không xác định khi kiểm tra: ' + err.message,
        statusCode: 500
      };
    }
  };
  
  // Chạy tất cả các kiểm tra
  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Nếu cần, thiết lập API key cho các request
      if (apiKey) {
        accountService.setApiKey(apiKey);
      }
      
      // Chạy từng kiểm tra theo thứ tự
      const results = [];
      
      for (const endpoint of apiEndpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Cập nhật kết quả theo thời gian thực
        setTestResults([...results]);
        
        // Tạm dừng giữa các request để tránh quá tải server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Tạo báo cáo tổng hợp
      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
      
      setSummary({
        passedTests,
        totalTests,
        successRate: Math.round((passedTests / totalTests) * 100),
        avgResponseTime: Math.round(avgResponseTime)
      });
    } catch (err) {
      console.error('Lỗi khi chạy kiểm tra:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Tự động chạy kiểm tra nếu được bật
  useEffect(() => {
    if (autoTest) {
      runAllTests();
    }
  }, [autoTest]);
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Kiểm tra tích hợp API Backend</h2>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            variant="outline"
            size="md"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            }
          >
            {showApiKeyInput ? 'Ẩn API Key' : 'Nhập API Key'}
          </Button>
          
          <Button
            onClick={runAllTests}
            variant="primary"
            size="md"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
            loading={loading}
            loadingText="Đang kiểm tra..."
            disabled={loading}
          >
            Chạy kiểm tra API
          </Button>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-test"
              checked={autoTest}
              onChange={(e) => setAutoTest(e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-test" className="ml-2 block text-sm text-gray-900">
              Tự động kiểm tra khi tải trang
            </label>
          </div>
        </div>
        
        {showApiKeyInput && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md animate-fadeIn">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              API Key (nếu cần)
            </label>
            <div className="flex">
              <input
                type="password"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Nhập API key nếu cần xác thực"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              API key sẽ được sử dụng cho tất cả các request trong phiên kiểm tra này
            </p>
          </div>
        )}
      </div>
      
      {loading && testResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="lg" color="primary" variant="spinner" text="Đang khởi tạo kiểm tra..." />
        </div>
      )}
      
      {testResults.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="font-medium text-gray-800">Kết quả kiểm tra API</h3>
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-3 flex items-center justify-between ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    {result.passed ? (
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm px-2 py-1 rounded-full ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.passed ? 'Thành công' : 'Thất bại'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{result.responseTime}ms</span>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div className="text-sm mb-2">
                    <span className="font-medium">Mã trạng thái:</span> {result.statusCode}
                  </div>
                  
                  {result.error && (
                    <div className="bg-red-50 p-3 rounded-md mb-3 text-sm text-red-700">
                      <span className="font-medium">Lỗi:</span> {result.error}
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Dữ liệu phản hồi:</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          Sao chép
                        </button>
                      </div>
                      <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {summary && (
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Tổng kết kiểm tra</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Số lượng API đã kiểm tra</div>
                  <div className="text-xl font-semibold">{summary.totalTests}</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Số lượng API thành công</div>
                  <div className="text-xl font-semibold text-green-600">{summary.passedTests}</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Tỷ lệ thành công</div>
                  <div className="text-xl font-semibold">{summary.successRate}%</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Thời gian phản hồi TB</div>
                  <div className="text-xl font-semibold">{summary.avgResponseTime}ms</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Alert
                  type={summary.successRate === 100 ? 'success' : 'warning'}
                  message={
                    summary.successRate === 100
                      ? 'Tất cả API đều hoạt động bình thường!'
                      : `Phát hiện ${summary.totalTests - summary.passedTests} API không hoạt động như mong đợi. Vui lòng kiểm tra chi tiết từng API.`
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationTester;
