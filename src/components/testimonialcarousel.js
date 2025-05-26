import React, { useState, useEffect, useCallback } from 'react';
import { testimonials } from '../data/testimonials';
import StarRating from './StarRating';

const TestimonialCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 7000); // Increased interval
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const { name, text, rating, avatar } = testimonials[currentTestimonial];

  return (
    <div className="relative max-w-3xl mx-auto glassmorphism p-8 rounded-xl shadow-xl">
      <div className="flex flex-col items-center text-center">
        <img src={avatar} alt={name} className="w-24 h-24 rounded-full mb-4 border-4 border-white dark:border-gray-700 shadow-md" />
        <div className="mb-3">
          <StarRating rating={rating} starSize="w-6 h-6" />
        </div>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">"{text}"</p>
        <p className="font-semibold text-gray-800 dark:text-white">— {name}</p>
      </div>
      
      <button 
        onClick={prevTestimonial}
        aria-label="Previous testimonial"
        className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <i className="fas fa-chevron-left w-5 h-5"></i>
      </button>
      
      <button 
        onClick={nextTestimonial}
        aria-label="Next testimonial"
        className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <i className="fas fa-chevron-right w-5 h-5"></i>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            aria-label={`Go to testimonial ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentTestimonial === index ? 'bg-primary dark:bg-secondary scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;

