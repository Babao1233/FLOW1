import React, { useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';
import '../../styles/animations.css';
import { accountService } from '../../services/accountService';

/**
 * Component kiểm thử API
 * Cho phép kiểm tra kết nối với API backend và xử lý lỗi
 */
const ApiTester = () => {
  const [selectedApi, setSelectedApi] = useState('');
  const [apiParams, setApiParams] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Danh sách các API có thể kiểm thử
  const apiEndpoints = [
    { value: 'getProfile', label: 'Lấy thông tin hồ sơ', service: 'profile', method: 'getProfile', params: {} },
    { value: 'updateProfile', label: 'Cập nhật hồ sơ', service: 'profile', method: 'updateProfile', params: { fullName: '', email: '', phone: '' } },
    { value: 'changePassword', label: 'Đổi mật khẩu', service: 'profile', method: 'changePassword', params: { currentPassword: '', newPassword: '' } },
    { value: 'getAddresses', label: 'Lấy danh sách địa chỉ', service: 'address', method: 'getAddresses', params: {} },
    { value: 'addAddress', label: 'Thêm địa chỉ', service: 'address', method: 'addAddress', params: { fullName: '', phone: '', address: '', ward: '', district: '', province: '', isDefault: false } },
    { value: 'updateAddress', label: 'Cập nhật địa chỉ', service: 'address', method: 'updateAddress', params: { id: '', fullName: '', phone: '', address: '', ward: '', district: '', province: '', isDefault: false } },
    { value: 'deleteAddress', label: 'Xóa địa chỉ', service: 'address', method: 'deleteAddress', params: { id: '' } },
    { value: 'setDefaultAddress', label: 'Đặt địa chỉ mặc định', service: 'address', method: 'setDefaultAddress', params: { id: '' } },
    { value: 'getOrders', label: 'Lấy danh sách đơn hàng', service: 'order', method: 'getOrders', params: { page: 1, limit: 10, status: '', search: '' } },
    { value: 'getOrderById', label: 'Lấy chi tiết đơn hàng', service: 'order', method: 'getOrderById', params: { id: '' } },
    { value: 'cancelOrder', label: 'Hủy đơn hàng', service: 'order', method: 'cancelOrder', params: { id: '', reason: '' } },
  ];
  
  // Xử lý khi chọn API
  const handleApiChange = (e) => {
    const selected = e.target.value;
    setSelectedApi(selected);
    
    // Reset kết quả và lỗi
    setResult(null);
    setError(null);
    
    // Tìm API đã chọn và thiết lập tham số
    const endpoint = apiEndpoints.find(api => api.value === selected);
    if (endpoint) {
      setApiParams(endpoint.params);
    } else {
      setApiParams({});
    }
  };
  
  // Xử lý khi thay đổi giá trị tham số
  const handleParamChange = (key, value) => {
    setApiParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Xử lý khi click nút kiểm thử
  const handleTestApi = async () => {
    // Tìm API đã chọn
    const endpoint = apiEndpoints.find(api => api.value === selectedApi);
    if (!endpoint) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Gọi API tương ứng
      const response = await accountService[endpoint.service][endpoint.method](
        ...(Object.keys(endpoint.params).length > 0 ? [apiParams] : [])
      );
      
      // Hiển thị kết quả
      setResult({
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      // Xử lý lỗi
      setError({
        message: err.message || 'Đã xảy ra lỗi khi gọi API',
        statusCode: err.statusCode || 'Không xác định',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Render form tham số dựa trên API đã chọn
  const renderParamFields = () => {
    if (!selectedApi) return null;
    
    const endpoint = apiEndpoints.find(api => api.value === selectedApi);
    if (!endpoint || Object.keys(endpoint.params).length === 0) {
      return <p className="text-sm text-gray-500 italic">API này không yêu cầu tham số.</p>;
    }
    
    return (
      <div className="space-y-4">
        {Object.entries(endpoint.params).map(([key, defaultValue]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
              {key}
            </label>
            {typeof defaultValue === 'boolean' ? (
              <input
                type="checkbox"
                id={key}
                checked={apiParams[key] || false}
                onChange={(e) => handleParamChange(key, e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
            ) : (
              <input
                type="text"
                id={key}
                value={apiParams[key] || ''}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Công cụ kiểm thử API</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="api-endpoint" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn API để kiểm thử
            </label>
            <select
              id="api-endpoint"
              value={selectedApi}
              onChange={handleApiChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
            >
              <option value="">-- Chọn API --</option>
              {apiEndpoints.map(api => (
                <option key={api.value} value={api.value}>
                  {api.label}
                </option>
              ))}
            </select>
          </div>
          
          {selectedApi && (
            <>
              <div className="border-b md:border-b-0 md:border-r border-gray-200 pr-0 md:pr-6 pb-6 md:pb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cấu hình yêu cầu</h3>
                {renderParamFields()}
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleTestApi}
                  variant="primary"
                  size="md"
                  className="mt-4"
                  loading={loading}
                  loadingText="Đang gọi API..."
                >
                  Kiểm thử API
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="pt-6 md:pt-0 md:border-l border-gray-200 pl-0 md:pl-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kết quả</h3>
          
          {loading && (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md animate-pulse-custom">
              <Loading size="lg" color="primary" text="Đang xử lý yêu cầu..." />
            </div>
          )}
          
          {!loading && result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 animate-fadeIn">
              <Alert
                type="success"
                message="API gọi thành công"
                dismissible={false}
              />
              <p className="text-sm text-gray-500 mb-2 mt-2">Thời gian: {new Date(result.timestamp).toLocaleString('vi-VN')}</p>
              <div className="bg-white rounded border border-gray-200 p-3 mt-3 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                  <span>Kết quả dữ liệu</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))}
                    className="text-amber-600 hover:text-amber-800 focus:outline-none"
                    title="Sao chép JSON"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
                <pre className="text-xs overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2" style={{ maxHeight: '300px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 animate-fadeIn">
              <Alert
                type="error"
                message="Lỗi khi gọi API"
                dismissible={false}
              />
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-500">Thời gian: {new Date(error.timestamp).toLocaleString('vi-VN')}</p>
                <div className="p-3 bg-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-700 mb-1">Mã lỗi: {error.statusCode}</p>
                  <p className="text-sm text-red-600 font-mono">{error.message}</p>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-amber-600 hover:text-amber-800 focus:outline-none flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Đóng thông báo lỗi
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !result && !error && (
            <div className="bg-gray-50 rounded-md p-6 flex flex-col items-center justify-center h-32">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-500 text-sm text-center">Chọn một API và nhấn "Kiểm thử API" để xem kết quả.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;