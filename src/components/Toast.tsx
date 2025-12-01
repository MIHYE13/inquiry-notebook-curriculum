import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-lg animate-slide-in z-50">
      {message}
    </div>
  );
};

export default Toast;
