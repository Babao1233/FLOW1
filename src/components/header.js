import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { CartContext } from '../contexts/CartContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { cartCount } = useContext(CartContext);

  const navLinkClasses = ({ isActive }) =>
    `font-medium transition-colors duration-200 ${
      isActive 
        ? 'text-primary dark:text-secondary' 
        : 'hover:text-primary dark:hover:text-secondary'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yapee</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={navLinkClasses} end>Trang Chủ</NavLink>
          <NavLink to="/products" className={navLinkClasses}>Sản Phẩm</NavLink> {/* Assuming a general products page */}
          <NavLink to="/about" className={navLinkClasses}>Về Chúng Tôi</NavLink>
          <NavLink to="/contact" className={navLinkClasses}>Liên Hệ</NavLink>
        </nav>

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleDarkMode} 
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <i className="fas fa-sun w-5 h-5 text-yellow-400"></i>
            ) : (
              <i className="fas fa-moon w-5 h-5 text-gray-600"></i>
            )}
          </button>
          
          <Link to="/cart" aria-label="View shopping cart" className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <i className="fas fa-shopping-cart w-5 h-5"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/account" aria-label="User account" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <i className="fas fa-user w-5 h-5"></i>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

