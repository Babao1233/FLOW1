import React from 'react';

/**
 * Component lọc sản phẩm theo đánh giá sao
 * Cho phép người dùng lọc sản phẩm theo số sao đánh giá
 */
const RatingFilter = ({ selectedRating, setSelectedRating }) => {
  // Tạo các mức đánh giá sao từ 5 đến 1
  const ratingOptions = [5, 4, 3, 2, 1];

  // Hiển thị sao theo số lượng
  const renderStars = (count) => {
    const stars = [];
    
    // Thêm sao màu vàng (đã đánh giá)
    for (let i = 0; i < count; i++) {
      stars.push(
        <svg key={`star-filled-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Thêm sao màu xám (chưa đánh giá)
    for (let i = count; i < 5; i++) {
      stars.push(
        <svg key={`star-empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-3">Đánh giá</h3>
      
      <div className="space-y-2">
        <div 
          className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
            !selectedRating ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedRating(null)}
        >
          <span className="flex-grow">Tất cả đánh giá</span>
          {!selectedRating && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {ratingOptions.map((rating) => (
          <div 
            key={rating}
            className={`flex items-center cursor-pointer py-1 px-2 rounded-md ${
              selectedRating === rating ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedRating(rating)}
          >
            <div className="flex items-center">
              <div className="flex mr-2">
                {renderStars(rating)}
              </div>
              <span>trở lên</span>
            </div>
            {selectedRating === rating && (
              <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingFilter;