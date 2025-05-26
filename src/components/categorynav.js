import React from 'react';
import { categories } from '../data/products'; // Assuming categories are in products.js or a separate file

const CategoryNav = ({ activeCategory, setActiveCategory }) => {
  return (
    // sticky top-[68px] assumes a header height of approximately 68px.
    // This might need adjustment if the header's height changes significantly.
    // Header height is derived from its padding (py-4 ~ 32px) and content (logo, nav links, search ~36px).
    <section className="py-4 md:py-6 bg-gray-50 dark:bg-gray-800/50 sticky top-[68px] z-30 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2 md:space-x-3 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 transform hover:scale-105
                ${activeCategory === category.id
                  ? 'bg-primary text-white shadow-md ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-800'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm hover:shadow-md'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;

