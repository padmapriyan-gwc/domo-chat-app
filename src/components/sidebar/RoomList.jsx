import React, { useState } from 'react';
import { RoomItem } from './RoomItem';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function RoomList({
  rooms,
  loading,
  activeRoomId,
  onSelectRoom,
  currentUser,
  unreadCounts = {},
}) {
  const [search, setSearch] = useState('');

  const publicRoom = { id: 'general', name: 'general', type: 'public' };

  const getRoomLabel = (room) =>
    room.type === 'dm'
      ? room.members?.find(m => m !== currentUser) || room.name
      : room.name;

  const filtered = rooms.filter(room =>
    getRoomLabel(room).toLowerCase().includes(search.toLowerCase())
  );

  const dms    = filtered.filter(r => r.type === 'dm');
  const groups = filtered.filter(r => r.type === 'group');

  if (loading) return <LoadingSpinner text="Loading rooms..." />;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Search input */}
      <div className="px-3 pt-3 pb-1">
        <input
          className="w-full px-3 py-2 rounded-xl bg-gray-100 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     placeholder-gray-400"
          placeholder="Search chats..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Public */}
        <div className="px-3 pt-2">
          <p className="text-xs text-gray-400 font-medium px-2 mb-1">
            Public
          </p>
          <RoomItem
            room={publicRoom}
            isActive={activeRoomId === 'general'}
            onClick={onSelectRoom}
            currentUser={currentUser}
            unreadCount={unreadCounts['general'] || 0}
          />
        </div>

        {/* DMs */}
        <div className="px-3 pt-3">
          <p className="text-xs text-gray-400 font-medium px-2 mb-1">
            Direct messages
          </p>
          {dms.length === 0 ? (
            <p className="text-xs text-gray-300 px-2 py-2">
              {search ? 'No results' : 'No DMs yet — click + to start one'}
            </p>
          ) : (
            dms.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isActive={activeRoomId === room.id}
                onClick={onSelectRoom}
                currentUser={currentUser}
                unreadCount={unreadCounts[room.id] || 0}
              />
            ))
          )}
        </div>

        {/* Groups */}
        <div className="px-3 pt-3">
          <p className="text-xs text-gray-400 font-medium px-2 mb-1">
            Groups
          </p>
          {groups.length === 0 ? (
            <p className="text-xs text-gray-300 px-2 py-2">
              {search ? 'No results' : 'No groups yet — click ⊞ to create one'}
            </p>
          ) : (
            groups.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isActive={activeRoomId === room.id}
                onClick={onSelectRoom}
                currentUser={currentUser}
                unreadCount={unreadCounts[room.id] || 0}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}