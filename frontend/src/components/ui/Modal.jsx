import React, { useEffect, useRef } from 'react';

/**
 * Component Modal tái sử dụng
 * @param {Object} props - Props của component
 * @param {boolean} props.isOpen - Trạng thái hiển thị của modal
 * @param {function} props.onClose - Hàm xử lý khi đóng modal
 * @param {string} props.title - Tiêu đề của modal
 * @param {React.ReactNode} props.children - Nội dung bên trong modal
 * @param {string} props.size - Kích thước của modal (sm, md, lg, xl, full)
 * @param {boolean} props.closeOnOutsideClick - Cho phép đóng modal khi click bên ngoài
 * @param {React.ReactNode} props.footer - Nội dung footer của modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  closeOnOutsideClick = true,
  footer
}) => {
  const modalRef = useRef(null);
  
  // Xác định kích thước dựa trên props
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  // Xử lý click outside để đóng modal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Xử lý phím Esc để đóng modal
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscKey);
      // Ngăn cuộn trang khi modal mở
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
      // Khôi phục cuộn trang khi modal đóng
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, closeOnOutsideClick]);
  
  // Không render gì nếu modal đóng
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay nền */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
        
        {/* Trick để căn giữa modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal content */}
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeMap[size] || sizeMap.md} w-full`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Đóng</span>
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="px-4 py-4 sm:p-6">
            {children}
          </div>
          
          {/* Footer nếu có */}
          {footer && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;