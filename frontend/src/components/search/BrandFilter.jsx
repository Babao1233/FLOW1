import React, { useState } from 'react';

/**
 * Component lọc sản phẩm theo thương hiệu
 * Cho phép người dùng chọn một hoặc nhiều thương hiệu
 */
const BrandFilter = ({ brands, selectedBrands, setSelectedBrands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  // Số lượng thương hiệu hiển thị mặc định
  const defaultVisibleCount = 5;
  
  // Lọc thương hiệu theo từ khóa tìm kiếm
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Danh sách thương hiệu hiển thị (tất cả hoặc một phần)
  const visibleBrands = showAll ? filteredBrands : filteredBrands.slice(0, defaultVisibleCount);
  
  // Xử lý khi chọn thương hiệu
  const handleBrandChange = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };
  
  // Xóa tất cả các thương hiệu đã chọn
  const clearAllBrands = () => {
    setSelectedBrands([]);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold">Thương hiệu</h3>
        {selectedBrands.length > 0 && (
          <button 
            onClick={clearAllBrands}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      {/* Tìm kiếm thương hiệu */}
      {brands.length > 7 && (
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300 text-sm"
            placeholder="Tìm thương hiệu"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Danh sách thương hiệu */}
      <div className="space-y-2">
        {visibleBrands.map((brand) => (
          <div key={brand.id} className="flex items-center">
            <input
              type="checkbox"
              id={`brand-${brand.id}`}
              checked={selectedBrands.includes(brand.id)}
              onChange={() => handleBrandChange(brand.id)}
              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor={`brand-${brand.id}`} className="ml-2 cursor-pointer text-gray-700 text-sm flex-grow">
              {brand.name}
            </label>
            {brand.count && (
              <span className="text-xs text-gray-500">({brand.count})</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Nút hiện thêm/ẩn bớt */}
      {filteredBrands.length > defaultVisibleCount && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center"
        >
          {showAll ? 'Thu gọn' : `Xem thêm (${filteredBrands.length - defaultVisibleCount})`}
          <svg 
            className={`w-4 h-4 ml-1 transform ${showAll ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      
      {/* Hiển thị khi không có kết quả tìm kiếm */}
      {searchTerm && filteredBrands.length === 0 && (
        <p className="text-sm text-gray-500 italic mt-2">
          Không tìm thấy thương hiệu phù hợp
        </p>
      )}
    </div>
  );
};

export default BrandFilter;