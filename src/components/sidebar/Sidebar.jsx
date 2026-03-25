import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRooms } from "../../hooks/useRooms";
import { RoomList } from "./RoomList";
import { Avatar } from "../common/Avatar";
import { Plus, Users, LogOut } from "lucide-react";

export function Sidebar({
  activeRoomId,
  onSelectRoom,
  onNewChat,
  onNewGroup,
  onLogout,
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const {
    rooms,
    loading,
    unreadCounts = {}, // default fallback
    clearUnread,
  } = useRooms(user.username, activeRoomId);

  // avoid clearing unread too early
  const handleSelectRoom = (room) => {
    onSelectRoom(room);

    // Slight delay so user can see unread before it resets
    setTimeout(() => {
      clearUnread(room.id);
    }, 200);
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "dm", label: "DMs" },
    { id: "group", label: "Groups" },
  ];

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-violet-50 to-pink-50 border-r border-gray-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar name={user.username} size="sm" />
            <span className="text-gray-800 text-sm font-semibold truncate max-w-[110px]">
              {user.username}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={onNewChat}
              title="New DM (Ctrl+K)"
              className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                        text-gray-500 hover:text-violet-600
                        hover:bg-violet-100 active:scale-95 transition-all"
            >
              <Plus size={18} />
            </button>

            <button
              onClick={onNewGroup}
              title="New group (Ctrl+G)"
              className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                        text-gray-500 hover:text-violet-600
                        hover:bg-violet-100 active:scale-95 transition-all"
            >
              <Users size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                      text-gray-300 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200
                      text-gray-700 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold
                transition-all duration-150
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-100 to-pink-100 text-gray-500 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms */}
      <RoomList
        rooms={rooms}
        loading={loading}
        activeRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        currentUser={user.username}
        unreadCounts={unreadCounts} // ✅ always defined
        activeTab={activeTab}
        search={search}
      />

      {/* Footer */}
      <div className="flex flex-row px-4 py-3 border-t border-pink-50 flex-shrink-0">
        <button
          onClick={onLogout}
          title="Logout"
          className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                     text-red-400 hover:text-red-300
                     hover:bg-black/10 active:scale-95 transition-all duration-200"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
