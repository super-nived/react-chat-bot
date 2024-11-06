import React, { useEffect } from 'react';
import './Toaster.css'; // Separate CSS for the toaster

const Toaster = ({ message, type, clearToaster }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      clearToaster();
    }, 3000); // Automatically hide after 3 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, [clearToaster]);

  return (
    <div className={`toaster ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default Toaster;
