import React from 'react';
import { getUserColor } from '../../utils/helpers';

export function RoomItem({ room, isActive, onClick, currentUser, unreadCount = 0 }) {
  const label = room.type === 'dm'
    ? room.members?.find(m => m !== currentUser) || room.name
    : room.name;

  const initial    = label?.[0]?.toUpperCase() || '?';
  const { bg }     = getUserColor(label);
  const isGroup    = room.type === 'group';

  return (
    <button
      onClick={() => onClick(room)}
      className={`w-full flex items-center gap-3 px-3 py-2.5
                  rounded-xl transition-all duration-150 text-left
                  ${isActive
                    ? 'bg-violet-100 border-violet-400'
                    : 'hover:scale-[1.01]'}`}>
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center
                         justify-center text-sm font-semibold
                         text-white ${bg}`}>
          {initial}
        </div>
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5
                          rounded-full border-2 border-white
                          ${isActive ? 'border-purple-50' : 'border-white'}
                          bg-green-400`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm font-semibold truncate
                            ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
            {isGroup && (
              <span className="text-gray-400 mr-1 text-xs">⊞</span>
            )}
            {label}
          </span>
          <span className="text-gray-300 text-xs flex-shrink-0">
            {new Date().toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-gray-400 truncate">
            {room.type === 'public' ? 'Public channel'  :
             room.type === 'group'  ? `${room.members?.length || 0} members` :
             'Direct message'}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5
                             rounded-full flex items-center justify-center
                             text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}