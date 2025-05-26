import React from 'react';
import '../../styles/animations.css';

/**
 * Component Button tái sử dụng
 * @param {Object} props - Component props
 * @param {string} props.variant - Biến thể button (primary, secondary, outline, danger, link)
 * @param {string} props.size - Kích thước button (xs, sm, md, lg)
 * @param {boolean} props.fullWidth - Chiều rộng 100%
 * @param {boolean} props.disabled - Trạng thái vô hiệu hóa
 * @param {string} props.type - Loại button (button, submit, reset)
 * @param {Function} props.onClick - Hàm xử lý khi click
 * @param {React.ReactNode} props.children - Nội dung bên trong button
 * @param {string} props.className - Class CSS tuỳ chỉnh
 * @param {boolean} props.loading - Trạng thái đang tải
 * @param {string} props.loadingText - Văn bản hiển thị khi đang tải
 * @param {React.ReactNode} props.leftIcon - Icon bên trái
 * @param {React.ReactNode} props.rightIcon - Icon bên phải
 * @param {string} props.ariaLabel - Aria label cho trợ năng tiếp cận
 * @param {boolean} props.rounded - Bo tròn đầy đủ
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  ariaLabel,
  rounded = false,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center border font-medium focus:outline-none transition-all duration-200';
  
  const variantStyles = {
    primary: 'border-transparent text-white bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm',
    secondary: 'border-transparent text-amber-700 bg-amber-100 hover:bg-amber-200 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
    outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm',
    link: 'border-transparent text-amber-600 bg-transparent hover:text-amber-700 hover:underline focus:ring-0 shadow-none'
  };
  
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  const disabledStyles = disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${disabledStyles} ${widthStyles} ${roundedStyles} ${className}`;
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...rest}
    >
      <div className="flex items-center justify-center">
        {loading && (
          <span className="mr-2">
            <Loading 
              size="sm" 
              color={variant === 'outline' ? 'primary' : 'white'} 
            />
          </span>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {loading && loadingText ? loadingText : children}
        
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </div>
    </button>
  );
};

export default Button;