import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { accountService } from '../../services/accountService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';
import Modal from '../ui/Modal';
import '../../styles/animations.css';

/**
 * Component hiển thị chi tiết đơn hàng
 * Cho phép người dùng xem thông tin chi tiết về đơn hàng, trạng thái và quá trình giao hàng
 */
const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  
  // Lấy thông tin chi tiết đơn hàng khi component mount
  useEffect(() => {
    fetchOrderDetail();
  }, [id]);
  
  // Hàm lấy thông tin chi tiết đơn hàng từ API
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await accountService.order.getOrderById(id);
      setOrder(response.order);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', err);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý khi ấn nút hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setCancelReasonError('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    
    setCancelReasonError('');
    try {
      await accountService.order.cancelOrder(order.id, cancelReason);
      // Cập nhật lại thông tin đơn hàng
      fetchOrderDetail();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      setError(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    }
  };
  
  // Danh sách các lý do hủy đơn hàng phổ biến
  const cancelReasons = [
    'Tôi muốn thay đổi địa chỉ giao hàng',
    'Tôi muốn thay đổi phương thức thanh toán',
    'Tôi muốn mua sản phẩm khác',
    'Tôi đặt nhầm đơn hàng',
    'Tôi không còn nhu cầu mua hàng nữa'
  ];
  
  // Chuyển đổi trạng thái đơn hàng sang tiếng Việt
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };
  
  // Lấy màu sắc tương ứng với trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible={true}
          autoClose={5000}
        />
      )}
      
      {/* Hiển thị trạng thái loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 animate-pulse-custom">
          <Loading size="lg" color="primary" text="Đang tải thông tin đơn hàng..." />
        </div>
      )}
      
      {!loading && order && (
        <div className="animate-fadeIn">
          <div className="border-b pb-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Chi tiết đơn hàng #{order.orderNumber}</h2>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} self-start sm:self-auto`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          
          {/* Thông tin giao hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Thông tin giao hàng</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">{order.shipping?.fullName}</p>
                <p className="text-sm text-gray-700 mt-1">{order.shipping?.phone}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {order.shipping?.address}, {order.shipping?.ward}, {order.shipping?.district}, {order.shipping?.province}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Thông tin thanh toán</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phương thức thanh toán:</span> {order.payment?.method === 'cod' ? 'Thanh toán khi nhận hàng' : order.payment?.method}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Trạng thái thanh toán:</span> {order.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Danh sách sản phẩm */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">Sản phẩm đã đặt</h3>
            <div className="border border-gray-200 rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md object-cover" src={item.image || 'https://via.placeholder.com/150'} alt={item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                <Link to={`/products/${item.productId}`} className="hover:text-amber-600">
                                  {item.name}
                                </Link>
                              </div>
                              {item.variant && (
                                <div className="text-sm text-gray-500">
                                  {item.variant}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Tổng tiền */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">Tạm tính</span>
              <span className="text-sm font-medium text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">Phí vận chuyển</span>
              <span className="text-sm font-medium text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.shippingFee)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center py-2 text-green-600">
                <span className="text-sm">Giảm giá</span>
                <span className="text-sm font-medium">
                  -{new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2">
              <span className="text-base font-medium text-gray-900">Tổng cộng</span>
              <span className="text-base font-medium text-amber-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.totalAmount)}
              </span>
            </div>
          </div>
          
          {/* Quá trình vận chuyển */}
          {order.status !== 'cancelled' && (
            <div className="mt-8">
              <h3 className="text-base font-medium text-gray-900 mb-4">Quá trình vận chuyển</h3>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-between">
                  <div className={`flex flex-col items-center ${order.status !== 'cancelled' ? 'text-amber-600' : 'text-gray-500'}`}>
                    <div className={`h-5 w-5 rounded-full ${order.status !== 'cancelled' ? 'bg-amber-600' : 'bg-gray-300'} flex items-center justify-center`}>
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-xs mt-2">Đặt hàng</div>
                  </div>
                  <div className={`flex flex-col items-center ${['processing', 'shipping', 'completed'].includes(order.status) ? 'text-amber-600' : 'text-gray-500'}`}>
                    <div className={`h-5 w-5 rounded-full ${['processing', 'shipping', 'completed'].includes(order.status) ? 'bg-amber-600' : 'bg-gray-300'} flex items-center justify-center`}>
                      {['processing', 'shipping', 'completed'].includes(order.status) ? (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                    <div className="text-xs mt-2">Xác nhận</div>
                  </div>
                  <div className={`flex flex-col items-center ${['shipping', 'completed'].includes(order.status) ? 'text-amber-600' : 'text-gray-500'}`}>
                    <div className={`h-5 w-5 rounded-full ${['shipping', 'completed'].includes(order.status) ? 'bg-amber-600' : 'bg-gray-300'} flex items-center justify-center`}>
                      {['shipping', 'completed'].includes(order.status) ? (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                    <div className="text-xs mt-2">Giao hàng</div>
                  </div>
                  <div className={`flex flex-col items-center ${order.status === 'completed' ? 'text-amber-600' : 'text-gray-500'}`}>
                    <div className={`h-5 w-5 rounded-full ${order.status === 'completed' ? 'bg-amber-600' : 'bg-gray-300'} flex items-center justify-center`}>
                      {order.status === 'completed' ? (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                    <div className="text-xs mt-2">Hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Nút hủy đơn hàng */}
          {['pending', 'processing'].includes(order.status) && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-50"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Hủy đơn hàng
              </Button>
            </div>
          )}
          
          {/* Modal xác nhận hủy đơn hàng */}
          <Modal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Xác nhận hủy đơn hàng"
            size="md"
            footer={
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Quay lại
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelOrder}
                  loading={isSubmitting}
                  loadingText="Đang xử lý..."
                >
                  Hủy đơn hàng
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-gray-600">
                  Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                </p>
              </div>
              
              <div className="mt-4">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
                  Lý do hủy đơn hàng <span className="text-red-500">*</span>
                </label>
                <select
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    setCancelReasonError('');
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Chọn lý do --</option>
                  {cancelReasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                  <option value="other">Lý do khác</option>
                </select>
                {cancelReason === 'other' && (
                  <textarea
                    rows="3"
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md mt-2"
                    placeholder="Nhập lý do hủy đơn hàng"
                    value={cancelReason === 'other' ? '' : cancelReason}
                    onChange={(e) => {
                      setCancelReason(e.target.value);
                      setCancelReasonError('');
                    }}
                  ></textarea>
                )}
                {cancelReasonError && (
                  <div className="mt-2 animate-slideInDown">
                    <Alert
                      type="error"
                      message={cancelReasonError}
                      dismissible={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;