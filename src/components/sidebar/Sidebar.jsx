import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRooms } from '../../hooks/useRooms';
import { RoomList } from './RoomList';
import { Avatar } from '../common/Avatar';

export function Sidebar({ activeRoomId, onSelectRoom, onNewChat, onNewGroup, onLogout }) {
  const { user } = useAuth();
  const { rooms, loading } = useRooms(user.username);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4
                      border-b border-gray-100 flex-shrink-0">
        <h1 className="font-semibold text-gray-800 text-base">Chats</h1>
        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            title="New direct message"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100
                       text-gray-500 hover:text-blue-500 flex items-center
                       justify-center text-xl transition-colors"
          >
            +
          </button>
          <button
            onClick={onNewGroup}
            title="New group"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100
                       text-gray-500 hover:text-purple-500 flex items-center
                       justify-center text-sm font-bold transition-colors"
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Room list */}
      <RoomList
        rooms={rooms}
        loading={loading}
        activeRoomId={activeRoomId}
        onSelectRoom={onSelectRoom}
        currentUser={user.username}
      />

      {/* User footer */}
      <div className="flex items-center gap-3 px-4 py-3
                      border-t border-gray-100 flex-shrink-0">
        <Avatar name={user.username} color="blue" size="sm" />
        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
          {user.username}
        </span>
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>

    </div>
  );
}