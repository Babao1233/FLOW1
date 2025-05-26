/**
 * Các utility function hỗ trợ responsive cho ứng dụng
 */

/**
 * Kiểm tra xem thiết bị hiện tại có phải là thiết bị di động không
 * @returns {boolean} True nếu là thiết bị di động
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * Kiểm tra xem thiết bị hiện tại có phải là máy tính bảng không
 * @returns {boolean} True nếu là máy tính bảng
 */
export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Kiểm tra xem thiết bị hiện tại có phải là desktop không
 * @returns {boolean} True nếu là desktop
 */
export const isDesktop = () => {
  return window.innerWidth >= 1024;
};

/**
 * Hook sử dụng để lắng nghe sự thay đổi kích thước màn hình
 * @param {function} callback - Hàm callback khi kích thước thay đổi
 */
export const useWindowResize = (callback) => {
  useEffect(() => {
    // Gọi callback ban đầu
    callback();
    
    // Thêm event listener
    window.addEventListener('resize', callback);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', callback);
    };
  }, [callback]);
};

/**
 * Trả về class CSS phù hợp với kích thước màn hình
 * @param {object} classes - Đối tượng chứa các class cho từng kích thước màn hình
 * @returns {string} Class phù hợp
 */
export const responsiveClass = (classes) => {
  if (isMobile()) {
    return classes.mobile || '';
  }
  if (isTablet()) {
    return classes.tablet || classes.desktop || '';
  }
  return classes.desktop || '';
};

/**
 * Hỗ trợ debug responsive
 * @param {string} componentName - Tên component đang debug
 */
export const debugResponsive = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${componentName}] Screen width: ${window.innerWidth}px - ${isMobile() ? 'Mobile' : isTablet() ? 'Tablet' : 'Desktop'}`);
  }
};