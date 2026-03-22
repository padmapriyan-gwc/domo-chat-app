import React from 'react';
import { Avatar } from '../common/Avatar';

export function RoomItem({ room, isActive, onClick, currentUser }) {
  const label = room.type === 'dm'
    ? room.members?.find(m => m !== currentUser) || room.name
    : room.name;

  const colorMap = {
    dm:     'teal',
    group:  'purple',
    public: 'blue',
  };

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
      <Avatar
        name={room.type === 'group' ? '⊞' : label}
        color={colorMap[room.type] || 'blue'}
        size="md"
      />
      <span className="text-sm font-medium truncate">{label}</span>
    </button>
  );
}