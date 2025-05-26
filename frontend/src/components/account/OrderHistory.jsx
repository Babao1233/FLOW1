import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../../services/accountService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';
import '../../styles/animations.css';

/**
 * Component hiển thị lịch sử đơn hàng của người dùng
 * Cho phép người dùng xem và lọc các đơn hàng đã đặt
 */
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Lấy danh sách đơn hàng khi component mount hoặc các tham số thay đổi
  useEffect(() => {
    fetchOrders();
  }, [filter, page]);
  
  // Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Chuẩn bị tham số cho API
      const params = {
        page,
        limit: 10,
        status: filter !== 'all' ? filter : undefined,
        search: searchText || undefined
      };
      
      const response = await accountService.order.getOrders(params);
      
      setOrders(response.orders || []);
      setTotalPages(response.totalPages || 1);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi người dùng tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    fetchOrders();
  };
  
  // Hàm xử lý khi thay đổi bộ lọc
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };
  
  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await accountService.order.cancelOrder(orderId, 'Hủy theo yêu cầu của khách hàng');
        // Cập nhật lại danh sách đơn hàng
        fetchOrders();
      } catch (err) {
        console.error('Lỗi khi hủy đơn hàng:', err);
        setError(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
      }
    }
  };
  
  // Không cần lọc đơn hàng vì đã được xử lý bởi API
  const filteredOrders = orders || [];
  
  // Danh sách các trạng thái đơn hàng
  const statusOptions = [
    { value: 'all', label: 'Tất cả đơn hàng' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];
  
  // Hàm chuyển đổi trạng thái sang tiếng Việt và lớp CSS tương ứng
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xử lý', classes: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { label: 'Đang xử lý', classes: 'bg-blue-100 text-blue-800' };
      case 'shipping':
        return { label: 'Đang giao hàng', classes: 'bg-indigo-100 text-indigo-800' };
      case 'completed':
        return { label: 'Hoàn thành', classes: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Đã hủy', classes: 'bg-red-100 text-red-800' };
      default:
        return { label: status, classes: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Lịch sử đơn hàng</h2>
      
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible={true}
          autoClose={5000}
        />
      )}
      
      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo trạng thái
          </label>
          <select
            id="filter"
            value={filter}
            onChange={handleFilterChange}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm đơn hàng
          </label>
          <form onSubmit={handleSearch}>
            <div className="mt-1 relative rounded-md shadow-sm flex">
              <input
                type="text"
                name="search"
                id="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="focus:ring-amber-500 focus:border-amber-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                placeholder="Nhập mã đơn hàng hoặc tên sản phẩm"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="ml-2"
              >
                Tìm
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Hiển thị trạng thái loading */}
      {loading && (
        <div className="text-center py-10 animate-pulse-custom">
          <Loading size="lg" color="primary" text="Đang tải dữ liệu..." />
        </div>
      )}
      
      {/* Danh sách đơn hàng */}
      {!loading && filteredOrders.length > 0 ? (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mã đơn hàng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ngày đặt
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tổng tiền
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.classes}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/account/orders/${order.id}`} className="text-amber-600 hover:text-amber-900">
                        Chi tiết
                      </Link>
                      {['pending', 'processing'].includes(order.status) && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="ml-4 text-red-600 hover:text-red-900"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' 
              ? 'Bạn không có đơn hàng nào ở trạng thái này.'
              : searchText 
                ? 'Không tìm thấy đơn hàng nào phù hợp với từ khóa tìm kiếm.' 
                : 'Bạn chưa có đơn hàng nào.'}
          </p>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : null}
      
      {/* Phân trang */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              &laquo; Trước
            </button>
            
            {[...Array(totalPages).keys()].map(i => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${page === i + 1 ? 'bg-amber-50 border-amber-500 text-amber-600 z-10' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Sau &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;