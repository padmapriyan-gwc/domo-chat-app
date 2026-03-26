import React from 'react';

export function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-violet-200/60" />
      <span className="text-xs font-medium text-violet-500 px-3 py-1
                       rounded-full bg-violet-50/80 border border-violet-200/70
                       flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-violet-200/60" />
    </div>
  );
}