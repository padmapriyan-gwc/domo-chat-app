import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center h-full
                    text-gray-400 text-sm">
      {text}
    </div>
  );
}