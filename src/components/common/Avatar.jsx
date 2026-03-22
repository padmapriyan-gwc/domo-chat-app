import React from 'react';

const COLOR_MAP = {
  blue:   'bg-blue-100 text-blue-600',
  teal:   'bg-teal-100 text-teal-600',
  purple: 'bg-purple-100 text-purple-600',
  gray:   'bg-gray-100 text-gray-500',
};

export function Avatar({ name, color = 'blue', size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  return (
    <div className={`
      ${sizes[size]}
      ${COLOR_MAP[color]}
      rounded-full flex items-center justify-center
      font-semibold flex-shrink-0
    `}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}