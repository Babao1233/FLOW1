import React, { useState, useEffect } from 'react';
import '../../styles/animations.css';

/**
 * Component Alert hiển thị thông báo
 * @param {Object} props - Component props
 * @param {string} props.type - Loại thông báo (success, error, warning, info)
 * @param {string} props.message - Nội dung thông báo
 * @param {boolean} props.dismissible - Cho phép đóng thông báo
 * @param {number} props.autoClose - Thời gian tự động đóng (ms)
 * @param {string} props.className - Class CSS tuỳ chỉnh
 * @param {React.ReactNode} props.title - Tiêu đề thông báo
 * @param {React.ReactNode} props.icon - Icon tuỳ chỉnh
 * @param {boolean} props.withBorder - Hiển thị viền
 * @param {string} props.variant - Biến thể (solid, subtle, outline)
 */
const Alert = ({ 
  type = 'info', 
  message, 
  dismissible = true, 
  autoClose = 0, 
  className = '',
  title = '',
  icon = null,
  withBorder = true,
  variant = 'subtle',
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Tự động đóng thông báo sau thời gian autoClose
  useEffect(() => {
    if (autoClose > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible]);
  
  // Xử lý hiệu ứng khi đóng
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Thời gian của hiệu ứng fade out
  };
  
  // Nếu thông báo đã đóng, không hiển thị gì
  if (!isVisible) {
    return null;
  }
  
  // Xác định style dựa vào loại thông báo và variant
  const variantStyles = {
    subtle: {
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    solid: {
      success: 'bg-green-600 text-white border-transparent',
      error: 'bg-red-600 text-white border-transparent',
      warning: 'bg-yellow-500 text-white border-transparent',
      info: 'bg-blue-600 text-white border-transparent',
    },
    outline: {
      success: 'bg-white text-green-700 border-green-500',
      error: 'bg-white text-red-700 border-red-500',
      warning: 'bg-white text-yellow-700 border-yellow-500',
      info: 'bg-white text-blue-700 border-blue-500',
    }
  };
  
  const iconStyles = {
    success: variant === 'solid' ? 'text-white' : 'text-green-500',
    error: variant === 'solid' ? 'text-white' : 'text-red-500',
    warning: variant === 'solid' ? 'text-white' : 'text-yellow-500',
    info: variant === 'solid' ? 'text-white' : 'text-blue-500',
  };
  
  // Icon cho từng loại thông báo
  const icons = {
    success: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
  };
  
  const alertStyle = variantStyles[variant]?.[type] || variantStyles.subtle.info;
  const borderStyle = withBorder ? 'border' : 'border-0';
  const animationStyle = isLeaving ? 'animate-fadeOut' : 'animate-fadeIn';
  
  return (
    <div 
      className={`mb-4 p-3 rounded-md flex items-start ${alertStyle} ${borderStyle} ${animationStyle} ${className}`}
      role="alert"
      aria-live="assertive"
      {...rest}
    >
      <div className={`flex-shrink-0 mr-3 ${iconStyles[type] || iconStyles.info}`}>
        {icon || icons[type] || icons.info}
      </div>
      <div className="flex-grow">
        {title && (
          <h4 className="text-sm font-medium mb-1">{title}</h4>
        )}
        <div className="text-sm">{message}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          className={`flex-shrink-0 ml-3 -mt-1 -mr-1 p-1 rounded-full ${variant === 'solid' ? 'hover:bg-white/20' : 'hover:bg-gray-200'} focus:outline-none`}
          onClick={handleClose}
          aria-label="Đóng"
        >
          <svg className={`h-4 w-4 ${variant === 'solid' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;