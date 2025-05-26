import React, { useEffect, useState } from 'react';

const Toast = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2800); // slightly less than context timer to allow fade out
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div 
      id="toast-notification"
      className={`fixed top-20 right-4 md:right-6 p-4 rounded-lg shadow-xl text-sm font-medium transition-all duration-500 ease-in-out z-50
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}
        bg-green-500 text-white dark:bg-green-600`}
      role="alert"
      aria-live="assertive"
    >
      <i className="fas fa-check-circle mr-2"></i>
      {message}
    </div>
  );
};

export default Toast;

