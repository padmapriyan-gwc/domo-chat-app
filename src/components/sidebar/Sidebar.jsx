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

  const { rooms, loading, unreadCounts, clearUnread } = useRooms(
    user.username,
    activeRoomId,
  );

  const handleSelectRoom = (room) => {
    clearUnread(room.id);
    onSelectRoom(room);
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "dm", label: "DMs" },
    { id: "group", label: "Groups" },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
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
              className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                    text-black/50 hover:text-black
                    hover:bg-black/10 active:scale-95
                      transition-all duration-200"
              onClick={onNewChat}
              title="New DM (Ctrl+K)"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onNewGroup}
              title="New group (Ctrl+G)"
              className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                    text-black/50 hover:text-black
                    hover:bg-black/10 active:scale-95
                      transition-all duration-200"
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
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100
                      text-sm text-gray-700 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-300/50
                      focus:bg-white border border-transparent
                      focus:border-purple-200 transition-all"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold
                          transition-all duration-150
                          ${
                            activeTab === tab.id
                              ? "bg-white text-purple-600 shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
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
        unreadCounts={unreadCounts}
        activeTab={activeTab}
        search={search}
      />

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onLogout}
          title="Logout"
          className="btn-icon w-9 h-9 rounded-xl flex items-center justify-center
                    text-red-400 hover:text-red-300
                    hover:bg-black/10 active:scale-95
                      transition-all duration-200">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}