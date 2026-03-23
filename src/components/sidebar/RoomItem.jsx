import React from 'react';
import { Avatar } from '../common/Avatar';

export function RoomItem({ room, isActive, onClick, currentUser, unreadCount = 0 }) {
  const label = room.type === 'dm'
    ? room.members?.find(m => m !== currentUser) || room.name
    : room.name;

  const activeStyles = {
    dm:     'bg-blue-50 text-blue-700',
    group:  'bg-purple-50 text-purple-700',
    public: 'bg-blue-50 text-blue-700',
  };

  return (
    <button
      onClick={() => onClick(room)}
      className={`
        w-full flex items-center gap-3 px-3 py-3
        rounded-xl transition-colors text-left
        ${isActive
          ? activeStyles[room.type] || 'bg-blue-50 text-blue-700'
          : 'hover:bg-gray-50 text-gray-700'
        }
      `}
    >
      <Avatar name={label} size="md" />

      <span className="text-sm font-medium truncate flex-1">{label}</span>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="bg-blue-500 text-white text-xs font-semibold
                         px-1.5 py-0.5 rounded-full min-w-[20px]
                         text-center flex-shrink-0">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}