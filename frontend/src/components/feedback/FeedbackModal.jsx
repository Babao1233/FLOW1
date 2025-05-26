import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import '../../styles/animations.css';

/**
 * Modal thu thập phản hồi từ người dùng
 * Được thiết kế để tích hợp vào các luồng chính của ứng dụng
 * như trang xác nhận đơn hàng hoặc sau khi hoàn thành tác vụ quan trọng
 */
const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  context = 'general', // Ngữ cảnh của phản hồi: 'general', 'order', 'profile', etc.
  contextId = null, // ID của ngữ cảnh (ví dụ: ID đơn hàng)
  showContactField = true,
  autoShowTiming = 5000, // Hiển thị tự động sau 5 giây (nếu autoShow = true)
  autoShow = false,
  customTitle = '',
  customDescription = ''
}) => {
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [autoOpened, setAutoOpened] = useState(false);
  
  // Tự động hiển thị modal nếu được cấu hình
  useEffect(() => {
    if (autoShow && isOpen && !autoOpened) {
      const timer = setTimeout(() => {
        setAutoOpened(true);
      }, autoShowTiming);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, isOpen, autoOpened, autoShowTiming]);
  
  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFeedbackType('general');
      setRating(0);
      setFeedbackText('');
      setSubmitted(false);
      setError(null);
    }
  }, [isOpen]);
  
  // Các loại phản hồi dựa trên ngữ cảnh
  const getFeedbackTypes = () => {
    const baseTypes = [
      { id: 'general', label: 'Phản hồi chung' },
      { id: 'ui', label: 'Giao diện người dùng' },
      { id: 'performance', label: 'Hiệu suất ứng dụng' },
      { id: 'feature', label: 'Tính năng mới' },
      { id: 'bug', label: 'Báo lỗi' }
    ];
    
    // Bổ sung các loại phản hồi tùy theo ngữ cảnh
    if (context === 'order') {
      baseTypes.push({ id: 'shipping', label: 'Vận chuyển' });
      baseTypes.push({ id: 'payment', label: 'Thanh toán' });
    }
    
    if (context === 'profile') {
      baseTypes.push({ id: 'account', label: 'Tài khoản' });
      baseTypes.push({ id: 'security', label: 'Bảo mật' });
    }
    
    return baseTypes;
  };
  
  // Xử lý nộp form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu
    if (rating === 0) {
      setError('Vui lòng chọn mức độ đánh giá');
      return;
    }
    
    if (!feedbackText.trim()) {
      setError('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      // Mô phỏng gửi dữ liệu lên server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chuẩn bị dữ liệu gửi đi
      const feedbackData = {
        type: feedbackType,
        context,
        contextId,
        rating,
        content: feedbackText,
        contactInfo: contactInfo || 'Không cung cấp',
        device: {
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        }
      };
      
      // Lưu vào localStorage để demo
      const savedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      savedFeedback.push(feedbackData);
      localStorage.setItem('userFeedback', JSON.stringify(savedFeedback));
      
      // Hiển thị thông báo thành công
      setSubmitted(true);
      
      // Đóng modal sau 3 giây
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi phản hồi, vui lòng thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Hiển thị tiêu đề phù hợp với ngữ cảnh
  const getContextTitle = () => {
    if (customTitle) return customTitle;
    
    switch (context) {
      case 'order':
        return 'Đánh giá đơn hàng của bạn';
      case 'profile':
        return 'Đánh giá trải nghiệm cập nhật tài khoản';
      default:
        return 'Góp ý từ người dùng';
    }
  };
  
  // Hiển thị mô tả phù hợp với ngữ cảnh
  const getContextDescription = () => {
    if (customDescription) return customDescription;
    
    switch (context) {
      case 'order':
        return 'Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ đặt hàng và giao hàng';
      case 'profile':
        return 'Phản hồi của bạn giúp chúng tôi cải thiện trải nghiệm quản lý tài khoản';
      default:
        return 'Phản hồi của bạn giúp chúng tôi cải thiện sản phẩm tốt hơn';
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={!submitting ? onClose : undefined} 
      title={getContextTitle()}
      size="md"
    >
      {submitted ? (
        <div className="text-center py-6 animate-fadeIn">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Cảm ơn bạn đã góp ý!</h3>
          <p className="text-gray-600 mb-6">
            Phản hồi của bạn đã được ghi nhận và sẽ được xem xét cẩn thận.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 text-sm mb-6">
            {getContextDescription()}
          </p>
          
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại phản hồi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getFeedbackTypes().map((type) => (
                    <div
                      key={type.id}
                      className={`
                        border rounded-md px-3 py-2 text-sm cursor-pointer transition-colors
                        ${feedbackType === type.id 
                          ? 'bg-amber-50 border-amber-300 text-amber-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setFeedbackType(type.id)}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ hài lòng
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        rating >= value
                          ? 'bg-amber-500 text-white hover:bg-amber-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {rating > 0 ? (
                      rating <= 2 ? 'Không hài lòng' : rating === 3 ? 'Bình thường' : 'Hài lòng'
                    ) : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>
              
              <div>
                <label htmlFor="feedback-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung góp ý <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-content"
                  rows="4"
                  className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Hãy chia sẻ trải nghiệm của bạn hoặc góp ý để chúng tôi cải thiện sản phẩm..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  {feedbackText.length}/500 ký tự
                </p>
              </div>
              
              {showContactField && (
                <div>
                  <label htmlFor="contact-info" className="block text-sm font-medium text-gray-700 mb-1">
                    Thông tin liên hệ (không bắt buộc)
                  </label>
                  <input
                    type="text"
                    id="contact-info"
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Email hoặc số điện thoại của bạn"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Chúng tôi có thể liên hệ nếu cần thêm thông tin về phản hồi của bạn
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  loadingText="Đang gửi..."
                >
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default FeedbackModal;
