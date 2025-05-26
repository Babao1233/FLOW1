import React, { useState, useRef, useEffect } from 'react';

/**
 * Component tùy chọn sắp xếp sản phẩm
 * Cho phép người dùng sắp xếp sản phẩm theo các tiêu chí khác nhau
 */
const SortOptions = ({ selectedSort, setSelectedSort }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Danh sách các tùy chọn sắp xếp
  const sortOptions = [
    { value: 'relevance', label: 'Liên quan nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Thấp đến cao' },
    { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'bestselling', label: 'Bán chạy nhất' }
  ];
  
  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Chọn tùy chọn sắp xếp
  const handleSelectSort = (value) => {
    setSelectedSort(value);
    setIsOpen(false);
  };
  
  // Lấy label tương ứng với value đã chọn
  const getSelectedLabel = () => {
    const option = sortOptions.find(option => option.value === selectedSort);
    return option ? option.label : sortOptions[0].label;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          id="sort-options-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Sắp xếp theo: {getSelectedLabel()}</span>
          <svg className={`-mr-1 ml-2 h-5 w-5 transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="sort-options-menu"
        >
          <div className="py-1" role="none">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedSort === option.value 
                    ? 'bg-gray-100 text-amber-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                role="menuitem"
                onClick={() => handleSelectSort(option.value)}
              >
                <div className="flex items-center justify-between">
                  {option.label}
                  {selectedSort === option.value && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortOptions;