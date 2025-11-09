import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function Notification({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
           setTimeout(onClose, 300); // Allow fade out
        }
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onClose]);

  if (!isVisible) return null;

  let bgColor, textColor, Icon;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100 border-green-400';
      textColor = 'text-green-700';
      Icon = FiCheckCircle;
      break;
    case 'error':
      bgColor = 'bg-red-100 border-red-400';
      textColor = 'text-red-700';
      Icon = FiAlertTriangle;
      break;
    case 'warning':
      bgColor = 'bg-yellow-100 border-yellow-400';
      textColor = 'text-yellow-700';
      Icon = FiAlertTriangle;
      break;
    default: // info
      bgColor = 'bg-blue-100 border-blue-400';
      textColor = 'text-blue-700';
      Icon = FiInfo;
  }

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg border-l-4 ${bgColor} ${textColor} flex items-center justify-between max-w-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className="mr-3 flex-shrink-0" size={20} />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button 
        onClick={() => {
            setIsVisible(false);
            if(onClose) onClose();
        }} 
        className={`ml-4 -mr-1 p-1 rounded-md ${textColor} hover:bg-opacity-20 hover:bg-current focus:outline-none`}
        aria-label="Close"
      >
        <FiX size={18} />
      </button>
    </div>
  );
}