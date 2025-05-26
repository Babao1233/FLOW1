import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { accountService } from '../services/accountService';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import FeedbackModal from '../components/feedback/FeedbackModal';

/**
 * Trang xác nhận đơn hàng thành công
 * Hiển thị thông tin đơn hàng và tích hợp thu thập phản hồi
 */
const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        // Lấy thông tin đơn hàng từ API
        const orderData = await accountService.order.getOrderById({ id: orderId });
        setOrder(orderData);
        
        // Tự động hiển thị modal phản hồi sau 5 giây
        setTimeout(() => {
          setShowFeedback(true);
        }, 8000);
        
      } catch (err) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loading size="lg" color="primary" text="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Alert type="error" message={error} />
          <div className="mt-6 text-center">
            <Button onClick={() => navigate('/profile')}>
              Quay lại trang tài khoản
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Thông báo đặt hàng thành công */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Mã đơn hàng: <span className="font-medium">{orderId}</span>
          </p>
        </div>
        
        {/* Thông tin đơn hàng */}
        {order && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-amber-600 text-white px-6 py-4">
              <h2 className="text-lg font-semibold">Thông tin đơn hàng</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Thông tin chung</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                      <p className="font-medium">{new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <p className="font-medium">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                      <p className="font-medium">{order.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tổng tiền</p>
                      <p className="font-medium text-amber-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Địa chỉ giao hàng</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="font-medium">{order.shipping_address.full_name}</p>
                  <p className="text-gray-600">{order.shipping_address.phone}</p>
                  <p className="text-gray-600">{order.shipping_address.address}</p>
                  <p className="text-gray-600">
                    {order.shipping_address.ward}, {order.shipping_address.district}, {order.shipping_address.province}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-700 font-medium mb-2">Danh sách sản phẩm</h3>
                <div className="border rounded-md overflow-hidden">
                  {order.items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-4 ${index !== order.items.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={item.image_url || '/placeholder-product.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.options && Object.keys(item.options).map(key => (
                            <span key={key} className="mr-2">
                              {key}: {item.options[key]}
                            </span>
                          ))}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Các nút tác vụ */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => navigate('/products')} variant="outline">
            Tiếp tục mua sắm
          </Button>
          <Button onClick={() => navigate('/profile/orders')} variant="primary">
            Xem đơn hàng của tôi
          </Button>
          <Button 
            onClick={() => setShowFeedback(true)} 
            variant="outline"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
            }
          >
            Đánh giá trải nghiệm
          </Button>
        </div>
      </div>
      
      {/* Modal phản hồi */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        context="order"
        contextId={orderId}
        customTitle="Đánh giá trải nghiệm đặt hàng của bạn"
        customDescription="Phản hồi của bạn sẽ giúp chúng tôi cải thiện dịch vụ mua sắm và giao hàng."
      />
    </div>
  );
};

export default OrderConfirmationPage;
