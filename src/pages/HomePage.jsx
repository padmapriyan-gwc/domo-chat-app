import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNewChat(false);
        setShowNewGroup(false);
      }
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowNewChat(true);
      }
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowNewGroup(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setShowSidebar(false);
  };

  const handleRoomCreated = (room) => {
    setActiveRoom(room);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-100/55 to-pink-100">

      {/* Sidebar */}
      <div className={`
        flex flex-col h-full border-r border-violet-100
        ${showSidebar ? 'flex' : 'hidden'}
        w-full md:flex md:w-72 md:min-w-[280px]
        bg-gradient-to-b from-violet-50/90 to-pink-50/60
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
        flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-violet-50/60 via-white/90 to-pink-50/50
        ${showSidebar ? 'hidden md:flex' : 'flex'}
      `}>
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center
                          gap-3 bg-gradient-to-b from-violet-100/60 via-violet-50/50 to-pink-100/45">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 flex
                            items-center justify-center text-2xl">
              💬
            </div>
            <p className="text-gray-500 text-sm font-medium">Select a chat to start messaging</p>
            <p className="text-gray-400 text-xs">Press Ctrl+K to start a new chat</p>
          </div>
        )}
      </div>

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