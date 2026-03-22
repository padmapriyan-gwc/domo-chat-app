import React from 'react';
import { RoomItem } from './RoomItem';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function RoomList({ rooms, loading, activeRoomId, onSelectRoom, currentUser }) {
  const publicRoom  = { id: 'general', name: 'general', type: 'public' };
  const dms         = rooms.filter(r => r.type === 'dm');
  const groups      = rooms.filter(r => r.type === 'group');

  if (loading) return <LoadingSpinner text="Loading rooms..." />;

  return (
    <div className="flex-1 overflow-y-auto">

      {/* Public */}
      <div className="px-3 pt-3">
        <p className="text-xs text-gray-400 font-medium px-2 mb-1">
          Public
        </p>
        <RoomItem
          room={publicRoom}
          isActive={activeRoomId === 'general'}
          onClick={onSelectRoom}
          currentUser={currentUser}
        />
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
            <RoomItem
              key={room.id}
              room={room}
              isActive={activeRoomId === room.id}
              onClick={onSelectRoom}
              currentUser={currentUser}
            />
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
            <RoomItem
              key={room.id}
              room={room}
              isActive={activeRoomId === room.id}
              onClick={onSelectRoom}
              currentUser={currentUser}
            />
          ))
        )}
      </div>

    </div>
  );
}