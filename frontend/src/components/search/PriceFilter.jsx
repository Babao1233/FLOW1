import React, { useState, useEffect } from 'react';

/**
 * Component lọc sản phẩm theo khoảng giá
 * Cho phép người dùng chọn giá tối thiểu và tối đa
 */
const PriceFilter = ({ priceRange, setPriceRange }) => {
  const [localMinPrice, setLocalMinPrice] = useState('');
  const [localMaxPrice, setLocalMaxPrice] = useState('');
  
  // Các khoảng giá định sẵn phổ biến (VND)
  const predefinedRanges = [
    { id: 'all', label: 'Tất cả mức giá', min: '', max: '' },
    { id: 'under-500k', label: 'Dưới 500.000₫', min: '', max: '500000' },
    { id: '500k-1m', label: '500.000₫ - 1.000.000₫', min: '500000', max: '1000000' },
    { id: '1m-5m', label: '1.000.000₫ - 5.000.000₫', min: '1000000', max: '5000000' },
    { id: '5m-10m', label: '5.000.000₫ - 10.000.000₫', min: '5000000', max: '10000000' },
    { id: 'over-10m', label: 'Trên 10.000.000₫', min: '10000000', max: '' }
  ];

  // Cập nhật giá trị local khi priceRange thay đổi từ bên ngoài
  useEffect(() => {
    setLocalMinPrice(priceRange.min);
    setLocalMaxPrice(priceRange.max);
  }, [priceRange]);

  // Định dạng số thành chuỗi có dấu phân cách hàng nghìn
  const formatPrice = (price) => {
    if (!price) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Chuyển đổi chuỗi định dạng thành số
  const parsePrice = (priceString) => {
    if (!priceString) return '';
    return priceString.replace(/\./g, '');
  };

  // Xử lý khi nhập giá tối thiểu
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(parsePrice(value))) {
      setLocalMinPrice(parsePrice(value));
    }
  };

  // Xử lý khi nhập giá tối đa
  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(parsePrice(value))) {
      setLocalMaxPrice(parsePrice(value));
    }
  };

  // Áp dụng bộ lọc giá
  const applyPriceFilter = () => {
    setPriceRange({
      min: localMinPrice,
      max: localMaxPrice
    });
  };

  // Chọn khoảng giá định sẵn
  const selectPredefinedRange = (min, max) => {
    setPriceRange({ min, max });
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-3">Khoảng giá</h3>
      
      {/* Các khoảng giá định sẵn */}
      <div className="space-y-2 mb-4">
        {predefinedRanges.map((range) => (
          <div 
            key={range.id}
            className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
              priceRange.min === range.min && priceRange.max === range.max
                ? 'bg-amber-50 text-amber-600' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => selectPredefinedRange(range.min, range.max)}
          >
            <span className="flex-grow">{range.label}</span>
            {priceRange.min === range.min && priceRange.max === range.max && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>
      
      {/* Khoảng giá tùy chỉnh */}
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={formatPrice(localMinPrice)}
                onChange={handleMinPriceChange}
                onBlur={applyPriceFilter}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300 text-sm"
                placeholder="Từ"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-sm">
                ₫
              </div>
            </div>
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={formatPrice(localMaxPrice)}
                onChange={handleMaxPriceChange}
                onBlur={applyPriceFilter}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300 text-sm"
                placeholder="Đến"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-sm">
                ₫
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={applyPriceFilter}
          className="mt-3 w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default PriceFilter;