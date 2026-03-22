import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { NewChatModal } from '../components/NewChatModal';
import { NewGroupModal } from '../components/NewGroupModal';
import ChatPage from './ChatPage';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeRoom, setActiveRoom]       = useState({ id: 'general', name: 'general', type: 'public' });
  const [showNewChat, setShowNewChat]     = useState(false);
  const [showNewGroup, setShowNewGroup]   = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoomCreated = (room) => {
    setActiveRoom(room);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Left column: sidebar + user footer */}
      <div className="flex flex-col w-72 min-w-[280px] h-full border-r border-gray-100">
        <Sidebar
          activeRoomId={activeRoom?.id}
          onSelectRoom={setActiveRoom}
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
        />

        {/* User footer */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600
                          flex items-center justify-center text-sm font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 flex-1 truncate">
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Right column: chat window */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeRoom ? (
          <ChatPage room={activeRoom} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-sm">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}