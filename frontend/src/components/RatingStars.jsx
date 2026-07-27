import React from 'react';

const RatingStars = ({ rating = 0, size = 16, className = '' }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-yellow-500 fill-icon"
          style={{ fontSize: `${size}px` }}
        >
          star
        </span>
      );
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-yellow-500 fill-icon"
          style={{ fontSize: `${size}px` }}
        >
          star_half
        </span>
      );
    } else {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-outline-variant"
          style={{ fontSize: `${size}px` }}
        >
          star
        </span>
      );
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      {stars}
    </div>
  );
};

export default RatingStars;
