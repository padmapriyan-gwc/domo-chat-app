import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center h-full text-xs"
      style={{ color: 'rgba(255,255,255,0.2)' }}>
      {text}
    </div>
  );
}