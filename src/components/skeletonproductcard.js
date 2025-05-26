import React from 'react';

const SkeletonProductCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 skeleton-item"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2 skeleton-item"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3 skeleton-item"></div>
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full mr-1 skeleton-item"></div>
          ))}
        </div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-1/3 skeleton-item"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 skeleton-item"></div>
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-full skeleton-item"></div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;

