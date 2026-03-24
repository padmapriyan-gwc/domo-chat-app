import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center h-full text-xs"
      style={{ color: 'rgba(124, 58, 237, 0.25)' }}>
      {text}
    </div>
  );
}