import React from 'react';
import '../../styles/animations.css';

/**
 * Component Loading hiển thị trạng thái đang tải
 * @param {Object} props - Component props
 * @param {string} props.size - Kích thước (xs, sm, md, lg, xl)
 * @param {string} props.color - Màu sắc (primary, secondary, white, gray)
 * @param {string} props.className - Class CSS tuỳ chỉnh
 * @param {string} props.text - Văn bản hiển thị
 * @param {string} props.variant - Loại hiệu ứng (spinner, dots, pulse, wave, skeleton)
 * @param {string} props.textPosition - Vị trí văn bản (top, bottom, right, left)
 * @param {boolean} props.fullScreen - Hiển thị toàn màn hình
 * @param {boolean} props.overlay - Hiển thị lớp phủ
 * @param {number} props.opacity - Độ trong suốt của lớp phủ (0-100)
 */
const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  className = '', 
  text = '',
  variant = 'spinner',
  textPosition = 'bottom',
  fullScreen = false,
  overlay = false,
  opacity = 75,
  ...rest
}) => {
  // Kích thước của spinner
  const sizeStyles = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  // Kích thước cho dots
  const dotSizes = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
    xl: 'h-3 w-3',
  };
  
  // Màu sắc của spinner
  const colorStyles = {
    primary: 'text-amber-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  
  // Vị trí văn bản
  const textPositionStyles = {
    top: 'flex-col-reverse',
    bottom: 'flex-col',
    left: 'flex-row-reverse items-center',
    right: 'flex-row items-center',
  };
  
  // Class cho text
  const textClasses = {
    top: 'mb-2',
    bottom: 'mt-2',
    left: 'mr-2',
    right: 'ml-2',
  };
  
  // Độ opacity cho lớp phủ
  const opacityClass = `bg-opacity-${opacity}`;
  
  // Container style
  const containerStyles = `flex ${textPositionStyles[textPosition] || 'flex-col'} justify-center items-center ${fullScreen ? 'fixed inset-0 z-50' : ''} ${overlay ? `bg-gray-900 ${opacityClass}` : ''} ${className}`;
  
  // Spinner component
  const Spinner = () => (
    <svg className={`animate-spin ${sizeStyles[size] || sizeStyles.md} ${colorStyles[color] || colorStyles.primary}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // Dots component
  const Dots = () => {
    const dotClass = `rounded-full ${dotSizes[size] || dotSizes.md} ${colorStyles[color] || colorStyles.primary}`;
    return (
      <div className="flex space-x-1">
        <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  };
  
  // Pulse component
  const Pulse = () => (
    <div className={`${sizeStyles[size] || sizeStyles.md} ${colorStyles[color] || colorStyles.primary} animate-pulse-custom rounded-full`}></div>
  );
  
  // Wave component
  const Wave = () => {
    const waveClass = `inline-block w-1.5 ${colorStyles[color] || colorStyles.primary}`;
    const heights = {
      xs: 'h-2',
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-5',
      xl: 'h-6',
    };
    const height = heights[size] || heights.md;
    
    return (
      <div className="flex items-center space-x-0.5">
        <div className={`${waveClass} ${height} animate-wave`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${waveClass} ${height} animate-wave`} style={{ animationDelay: '100ms' }}></div>
        <div className={`${waveClass} ${height} animate-wave`} style={{ animationDelay: '200ms' }}></div>
        <div className={`${waveClass} ${height} animate-wave`} style={{ animationDelay: '300ms' }}></div>
        <div className={`${waveClass} ${height} animate-wave`} style={{ animationDelay: '400ms' }}></div>
      </div>
    );
  };
  
  // Skeleton component
  const Skeleton = () => {
    const widths = {
      xs: 'w-16',
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-40',
      xl: 'w-48',
    };
    const heights = {
      xs: 'h-2',
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-5',
      xl: 'h-6',
    };
    
    return (
      <div className={`${widths[size] || widths.md} ${heights[size] || heights.md} bg-gray-200 rounded animate-pulse`}></div>
    );
  };
  
  // Lựa chọn loại hiệu ứng
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'wave':
        return <Wave />;
      case 'skeleton':
        return <Skeleton />;
      case 'spinner':
      default:
        return <Spinner />;
    }
  };
  
  return (
    <div className={containerStyles} {...rest}>
      {renderLoader()}
      {text && <p className={`text-sm ${colorStyles[color] || 'text-gray-600'} ${textClasses[textPosition] || 'mt-2'}`}>{text}</p>}
    </div>
  );
};

export default Loading;