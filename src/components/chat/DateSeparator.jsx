import React from 'react';

export function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs font-medium text-gray-400 px-3 py-1
                       rounded-full bg-gray-50 border border-gray-100
                       flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}