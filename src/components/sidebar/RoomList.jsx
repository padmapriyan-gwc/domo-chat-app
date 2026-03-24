import React from "react";
import { RoomItem } from "./RoomItem";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";

export function RoomList({
  rooms,
  loading,
  activeRoomId,
  onSelectRoom,
  currentUser,
  unreadCounts = {},
  activeTab = "all",
  search = "",
}) {
  const publicRoom = { id: "general", name: "general", type: "public" };

  // ✅ FIX #5: single presence subscription lifted here
  const onlineUsers = useOnlineUsers(currentUser);

  const getRoomLabel = (room) =>
    room.type === "dm"
      ? room.members?.find((m) => m !== currentUser) || room.name
      : room.name;

  const matchesSearch = (room) =>
    getRoomLabel(room).toLowerCase().includes(search.toLowerCase());

  const showPublic = activeTab === "all" && matchesSearch(publicRoom);

  const dms = rooms.filter(
    (r) =>
      r.type === "dm" &&
      (activeTab === "all" || activeTab === "dm") &&
      matchesSearch(r)
  );

  const groups = rooms.filter(
    (r) =>
      r.type === "group" &&
      (activeTab === "all" || activeTab === "group") &&
      matchesSearch(r)
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-300 text-xs">Loading...</p>
      </div>
    );
  }

  const isEmpty = !showPublic && dms.length === 0 && groups.length === 0;

  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2">
      {/* Empty search state */}
      {isEmpty && search && (
        <div className="flex flex-col items-center justify-center h-24 gap-1">
          <p className="text-gray-400 text-sm">No results for "{search}"</p>
          <p className="text-gray-300 text-xs">Try a different name</p>
        </div>
      )}

      {/* General / Public */}
      {showPublic && (
        <RoomItem
          room={publicRoom}
          isActive={activeRoomId === "general"}
          onClick={onSelectRoom}
          currentUser={currentUser}
          unreadCount={unreadCounts["general"] || 0}
          onlineUsers={onlineUsers}
        />
      )}

      {/* DM section */}
      {dms.length > 0 && (
        <div className="mt-1">
          {activeTab === "all" && (
            <p className="text-xs text-gray-600 font-semibold px-3 pt-3 pb-1 tracking-wide uppercase">
              Direct Messages
            </p>
          )}
          {dms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={activeRoomId === room.id}
              onClick={onSelectRoom}
              currentUser={currentUser}
              unreadCount={unreadCounts[room.id] || 0}
              onlineUsers={onlineUsers}
            />
          ))}
        </div>
      )}

      {/* Groups section */}
      {groups.length > 0 && (
        <div className="mt-1">
          {activeTab === "all" && (
            <p className="text-xs text-gray-600 font-semibold px-3 pt-3 pb-1 tracking-wide uppercase">
              Groups
            </p>
          )}
          {groups.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isActive={activeRoomId === room.id}
              onClick={onSelectRoom}
              currentUser={currentUser}
              unreadCount={unreadCounts[room.id] || 0}
              onlineUsers={onlineUsers}
            />
          ))}
        </div>
      )}

      {/* No rooms yet */}
      {isEmpty && !search && (
        <div className="flex flex-col items-center justify-center h-24 gap-1">
          <p className="text-gray-300 text-xs">No chats yet</p>
        </div>
      )}
    </div>
  );
}