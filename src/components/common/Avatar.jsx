import React from 'react';
import { getUserColor } from '../../utils/helpers';

export function Avatar({ name = '', size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const { bg, text } = getUserColor(name);

  return (
    <div className={`
      ${sizes[size]} ${bg} ${text}
      rounded-full flex items-center justify-center
      font-semibold shrink-0
    `}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}