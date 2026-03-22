import React, { useEffect, useState } from 'react';
import { ChatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeRoomId, onSelectRoom, onNewChat, onNewGroup }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      const data = await ChatService.fetchRooms(user.username);
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRoomLabel = (room) => {
    if (room.type === 'dm') {
      return room.members.find(m => m !== user.username) || room.name;
    }
    return room.name;
  };

  const getRoomInitial = (room) => {
    return getRoomLabel(room)[0]?.toUpperCase() || '?';
  };

  const dms     = rooms.filter(r => r.type === 'dm');
  const groups  = rooms.filter(r => r.type === 'group');

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-72 min-w-[280px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h1 className="font-semibold text-gray-800 text-base">Chats</h1>
        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            title="New direct message"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100
                       text-gray-500 hover:text-blue-500 flex items-center
                       justify-center text-lg transition-colors"
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

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-gray-400 text-center mt-6">Loading...</p>
        ) : (
          <>
            {/* General room — always shown */}
            <div className="px-3 pt-3">
              <p className="text-xs text-gray-400 font-medium px-2 mb-1">Public</p>
              <button
                onClick={() => onSelectRoom({ id: 'general', name: 'general', type: 'public' })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-colors text-left
                            ${activeRoomId === 'general'
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600
                                flex items-center justify-center text-sm font-semibold">
                  #
                </div>
                <span className="text-sm font-medium">general</span>
              </button>
            </div>

            {/* Direct Messages */}
            <div className="px-3 pt-4">
              <p className="text-xs text-gray-400 font-medium px-2 mb-1">
                Direct messages
              </p>
              {dms.length === 0 ? (
                <p className="text-xs text-gray-300 px-2 py-2">
                  No DMs yet — click + to start one
                </p>
              ) : (
                dms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-colors text-left
                                ${activeRoomId === room.id
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-600
                                    flex items-center justify-center text-sm font-semibold">
                      {getRoomInitial(room)}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {getRoomLabel(room)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Groups */}
            <div className="px-3 pt-4">
              <p className="text-xs text-gray-400 font-medium px-2 mb-1">
                Groups
              </p>
              {groups.length === 0 ? (
                <p className="text-xs text-gray-300 px-2 py-2">
                  No groups yet — click ⊞ to create one
                </p>
              ) : (
                groups.map(room => (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-colors text-left
                                ${activeRoomId === room.id
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600
                                    flex items-center justify-center text-sm font-semibold">
                      {getRoomInitial(room)}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {getRoomLabel(room)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};