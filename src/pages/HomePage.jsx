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
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* Sidebar */}
      <div className={`
        flex flex-col h-full border-r border-gray-100
        ${showSidebar ? 'flex' : 'hidden'}
        w-full md:flex md:w-72 md:min-w-[280px]
        bg-white
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
        flex-1 flex flex-col h-full overflow-hidden bg-white
        ${showSidebar ? 'hidden md:flex' : 'flex'}
      `}>
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center
                          h-full gap-3 bg-gray-50">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex
                            items-center justify-center text-2xl">
              💬
            </div>
            <p className="text-gray-400 text-sm">Select a chat to start messaging</p>
            <p className="text-gray-300 text-xs">Press Ctrl+K to start a new chat</p>
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