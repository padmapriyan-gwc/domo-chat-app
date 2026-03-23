import React from 'react';

export function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium px-2 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}