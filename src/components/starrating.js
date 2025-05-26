import React from 'react';

const StarRating = ({ rating, starSize = "w-4 h-4", color = "text-yellow-400 dark:text-yellow-500" }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className={`fas fa-star ${starSize} ${color}`}></i>
      ))}
      {halfStar && (
        <i key="half" className={`fas fa-star-half-alt ${starSize} ${color}`}></i>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className={`far fa-star ${starSize} ${color}`}></i>
      ))}
    </div>
  );
};

export default StarRating;

