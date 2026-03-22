import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { NewChatModal } from '../components/modals/NewChatModal';
import { NewGroupModal } from '../components/modals/NewGroupModal';
import { DEFAULT_ROOM } from '../constants';

export default function HomePage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [activeRoom, setActiveRoom]     = useState(DEFAULT_ROOM);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [showNewChat, setShowNewChat]   = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setShowSidebar(false); // mobile: go to chat
  };

  const handleRoomCreated = (room) => {
    setActiveRoom(room);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <div className={`
        flex flex-col h-full border-r border-gray-100 bg-white
        transition-all duration-200
        ${showSidebar ? 'flex' : 'hidden'}
        w-full md:flex md:w-72 md:min-w-[280px]
      `}>
        <Sidebar
          activeRoomId={activeRoom?.id}
          onSelectRoom={handleSelectRoom}
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Chat window */}
      <div className={`
        flex-1 flex flex-col h-full overflow-hidden
        ${showSidebar ? 'hidden md:flex' : 'flex'}
      `}>
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center
                          h-full text-gray-400">
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