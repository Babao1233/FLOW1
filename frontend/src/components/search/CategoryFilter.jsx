import React from 'react';

/**
 * Component lọc sản phẩm theo danh mục
 * Hiển thị danh sách các danh mục sản phẩm để người dùng có thể lọc theo loại
 */
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-3">Danh mục sản phẩm</h3>
      
      <div className="space-y-2">
        <div 
          className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
            !selectedCategory ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedCategory('')}
        >
          <span className="flex-grow">Tất cả sản phẩm</span>
          {!selectedCategory && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {categories.map((category) => (
          <div 
            key={category.id}
            className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
              selectedCategory === category.id ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="flex-grow">{category.name}</span>
            {category.count && (
              <span className={`text-sm ${
                selectedCategory === category.id ? 'text-amber-600' : 'text-gray-500'
              }`}>
                ({category.count})
              </span>
            )}
            {selectedCategory === category.id && (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;